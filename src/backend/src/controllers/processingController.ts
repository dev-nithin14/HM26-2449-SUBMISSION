import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { processingRepository, reportRepository, notificationRepository } from '../repositories/index.js';
import {
  CreateProcessingBatchSchema,
  UpdateProcessingBatchSchema,
  CreateRecycledProductSchema
} from '../validators/index.js';
import { processingService } from '../services/processing/processingService.js';

export async function getBatches(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const batches = await processingRepository.findAllBatches(token);
    return res.json({
      success: true,
      data: batches
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_BATCHES_FAILED', message: err.message }
    });
  }
}

export async function getBatchById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const batch = await processingRepository.findBatchById(id, token);
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Batch ${id} not found` }
      });
    }

    // Hydrate source reports for deep traceability
    const sourceReports = [];
    for (const repId of batch.source_report_ids) {
      const rep = await reportRepository.findById(repId);
      if (rep) sourceReports.push(rep);
    }

    // Hydrate generated products
    const allProducts = await processingRepository.findAllProducts(token);
    const batchProducts = allProducts.filter((p) => p.batch_id === batch.id);

    return res.json({
      success: true,
      data: {
        ...batch,
        source_reports: sourceReports,
        recycled_products: batchProducts
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_BATCH_FAILED', message: err.message }
    });
  }
}

export async function createBatch(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = CreateProcessingBatchSchema.parse(req.body);
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    const batch = await processingService.createBatchWithReports({
      sourceReportIds: validated.source_report_ids,
      intakeQuantityKg: validated.intake_quantity_kg,
      materialType: validated.material_type,
      processedByName: currentUser.name,
      notes: validated.notes,
      token
    });

    // Notify admin
    await notificationRepository.create({
      user_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'New Processing Batch Created',
      message: `Batch ${batch.id} initiated with ${validated.intake_quantity_kg} kg of ${validated.material_type} waste.`,
      type: 'INFO',
      read: false
    });

    return res.status(201).json({
      success: true,
      data: batch
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'CREATE_BATCH_FAILED', message: err.message }
    });
  }
}

export async function updateBatch(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const validated = UpdateProcessingBatchSchema.parse(req.body);
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    const batch = await processingRepository.findBatchById(id, token);
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Batch ${id} not found` }
      });
    }

    const updated = await processingRepository.updateBatch(id, {
      recovered_quantity_kg: validated.recovered_quantity_kg,
      rejected_quantity_kg: validated.rejected_quantity_kg,
      status: validated.status || batch.status,
      notes: validated.notes || batch.notes
    }, token);

    if (validated.status === 'COMPLETED') {
      for (const repId of batch.source_report_ids) {
        await reportRepository.update(repId, { status: 'RECYCLED' }, token);
        await reportRepository.addTimelineEvent(repId, {
          status: 'RECYCLED',
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: 'PROCESSING_TEAM',
          note: `Batch ${batch.id} processing finalized. Recovered ${validated.recovered_quantity_kg} kg material.`
        }, token);
      }
    }

    return res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'UPDATE_BATCH_FAILED', message: err.message }
    });
  }
}

export async function getProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const products = await processingRepository.findAllProducts(token);
    return res.json({
      success: true,
      data: products
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_PRODUCTS_FAILED', message: err.message }
    });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const validated = CreateRecycledProductSchema.parse(req.body);
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    const product = await processingRepository.createProduct({
      batch_id: validated.batch_id,
      product_name: validated.product_name,
      units_produced: validated.units_produced,
      unit_of_measure: validated.unit_of_measure,
      recycled_content_percentage: validated.recycled_content_percentage,
      dimensions_mm: validated.dimensions_mm,
      prototype_unit_cost_inr: validated.prototype_unit_cost_inr,
      intended_application: validated.intended_application,
      production_status: validated.production_status
    }, token);

    // Update batch to completed
    await processingRepository.updateBatch(validated.batch_id, {
      status: 'COMPLETED',
      completed_at: new Date().toISOString()
    }, token);

    // Mark source reports as RECYCLED
    const batch = await processingRepository.findBatchById(validated.batch_id, token);
    if (batch) {
      for (const repId of batch.source_report_ids) {
        await reportRepository.update(repId, { status: 'RECYCLED' }, token);
        await reportRepository.addTimelineEvent(repId, {
          status: 'RECYCLED',
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: currentUser.role,
          note: `Transformed into ${validated.units_produced} ${validated.unit_of_measure} of ${validated.product_name}. Recycled content: ${validated.recycled_content_percentage}%.`
        }, token);
      }
    }

    return res.status(201).json({
      success: true,
      data: product
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'CREATE_PRODUCT_FAILED', message: err.message }
    });
  }
}
