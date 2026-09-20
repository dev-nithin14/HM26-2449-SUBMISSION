import { v4 as uuidv4 } from 'uuid';
import { IProcessingRepository } from '../interfaces/index.js';
import { ProcessingBatch, RecycledProduct } from '../../types/index.js';
import { supabase, getSupabaseClient } from '../../lib/supabase.js';

export class SupabaseProcessingRepository implements IProcessingRepository {
  async findAllBatches(token?: string): Promise<ProcessingBatch[]> {
    const dbClient = getSupabaseClient(token);
    const { data: batches, error } = await dbClient
      .from('processing_batches')
      .select('*, batch_source_reports(report_id)')
      .order('created_at', { ascending: false });

    if (error || !batches) return [];

    return batches.map((b: any) => this.mapBatch(b));
  }

  async findBatchById(id: string, token?: string): Promise<ProcessingBatch | null> {
    const dbClient = getSupabaseClient(token);
    const { data: batch, error } = await dbClient
      .from('processing_batches')
      .select('*, batch_source_reports(report_id)')
      .eq('id', id)
      .maybeSingle();

    if (error || !batch) return null;
    return this.mapBatch(batch);
  }

  async createBatch(
    batchData: Omit<ProcessingBatch, 'id' | 'created_at' | 'updated_at' | 'recovery_rate_percentage'>,
    token?: string
  ): Promise<ProcessingBatch> {
    const dbClient = getSupabaseClient(token);
    const id = `RB-BATCH-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const row = {
      id,
      intake_quantity_kg: batchData.intake_quantity_kg,
      material_type: batchData.material_type,
      status: batchData.status || 'INTAKE',
      recovered_quantity_kg: batchData.recovered_quantity_kg || 0,
      rejected_quantity_kg: batchData.rejected_quantity_kg || 0,
      processed_by_name: batchData.processed_by_name,
      notes: batchData.notes || null,
      created_at: now,
      updated_at: now
    };

    const { error: bErr } = await dbClient.from('processing_batches').insert(row);
    if (bErr) {
      throw new Error(`Failed to create processing batch: ${bErr.message}`);
    }

    // Insert source report junction rows
    if (batchData.source_report_ids && batchData.source_report_ids.length > 0) {
      const junctionRows = batchData.source_report_ids.map((repId) => ({
        batch_id: id,
        report_id: repId
      }));
      await dbClient.from('batch_source_reports').insert(junctionRows);
    }

    const created = await this.findBatchById(id, token);
    if (!created) {
      throw new Error('Failed to retrieve newly created batch');
    }
    return created;
  }

  async updateBatch(
    id: string,
    updates: Partial<ProcessingBatch>,
    token?: string
  ): Promise<ProcessingBatch | null> {
    const dbClient = getSupabaseClient(token);
    const patch: any = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.recovered_quantity_kg !== undefined) patch.recovered_quantity_kg = updates.recovered_quantity_kg;
    if (updates.rejected_quantity_kg !== undefined) patch.rejected_quantity_kg = updates.rejected_quantity_kg;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.completed_at !== undefined) patch.completed_at = updates.completed_at;

    const { error } = await dbClient.from('processing_batches').update(patch).eq('id', id);
    if (error) {
      throw new Error(`Failed to update batch ${id}: ${error.message}`);
    }

    return this.findBatchById(id, token);
  }

  async findAllProducts(token?: string): Promise<RecycledProduct[]> {
    const dbClient = getSupabaseClient(token);
    const { data, error } = await dbClient
      .from('recycled_products')
      .select('*')
      .order('manufactured_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      batch_id: p.batch_id,
      product_name: p.product_name,
      units_produced: p.units_produced,
      unit_of_measure: p.unit_of_measure,
      recycled_content_percentage: p.recycled_content_percentage,
      dimensions_mm: p.dimensions_mm || undefined,
      prototype_unit_cost_inr: p.prototype_unit_cost_inr,
      intended_application: p.intended_application,
      production_status: p.production_status,
      manufactured_at: p.manufactured_at
    }));
  }

  async createProduct(
    productData: Omit<RecycledProduct, 'id' | 'manufactured_at'>,
    token?: string
  ): Promise<RecycledProduct> {
    const dbClient = getSupabaseClient(token);
    const id = `prd-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const row = {
      id,
      batch_id: productData.batch_id,
      product_name: productData.product_name,
      units_produced: productData.units_produced,
      unit_of_measure: productData.unit_of_measure,
      recycled_content_percentage: productData.recycled_content_percentage || 85,
      dimensions_mm: productData.dimensions_mm || null,
      prototype_unit_cost_inr: productData.prototype_unit_cost_inr || 0,
      intended_application: productData.intended_application,
      production_status: productData.production_status || 'PILOT',
      manufactured_at: now
    };

    const { error } = await dbClient.from('recycled_products').insert(row);
    if (error) {
      throw new Error(`Failed to create recycled product: ${error.message}`);
    }

    return {
      ...row,
      dimensions_mm: row.dimensions_mm || undefined
    } as RecycledProduct;
  }

  private mapBatch(row: any): ProcessingBatch {
    const sourceReportIds = (row.batch_source_reports || []).map((sr: any) => sr.report_id);
    const intake = row.intake_quantity_kg || 0;
    const recovered = row.recovered_quantity_kg || 0;
    const recoveryRate = intake > 0 ? Number(((recovered / intake) * 100).toFixed(1)) : 0;

    return {
      id: row.id,
      source_report_ids: sourceReportIds,
      intake_quantity_kg: row.intake_quantity_kg,
      material_type: row.material_type,
      status: row.status,
      recovered_quantity_kg: row.recovered_quantity_kg,
      rejected_quantity_kg: row.rejected_quantity_kg,
      recovery_rate_percentage: recoveryRate,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at || undefined,
      processed_by_name: row.processed_by_name,
      notes: row.notes || undefined
    };
  }
}
