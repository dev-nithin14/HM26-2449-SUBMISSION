import { v4 as uuidv4 } from 'uuid';
import { IReportRepository, ReportFilterOptions } from '../interfaces/index.js';
import { Report, TimelineEvent, ReportImage, AIAnalysis, ReportVerification } from '../../types/index.js';
import { supabase, getSupabaseClient } from '../../lib/supabase.js';

export class SupabaseReportRepository implements IReportRepository {
  async findById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*, report_images(*), ai_analyses(*), report_verifications!report_verifications_report_id_fkey(*), report_timeline(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapReport(data);
  }

  async findAll(filters?: ReportFilterOptions): Promise<Report[]> {
    let query = supabase
      .from('reports')
      .select('*, report_images(*), ai_analyses(*), report_verifications!report_verifications_report_id_fkey(*), report_timeline(*)')
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.waste_type) {
        query = query.eq('waste_type', filters.waste_type);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.zone_id) {
        query = query.eq('zone_id', filters.zone_id);
      }
      if (filters.citizen_id) {
        query = query.eq('citizen_id', filters.citizen_id);
      }
      if (filters.search) {
        const q = filters.search.trim();
        query = query.or(`id.ilike.%${q}%,address.ilike.%${q}%,citizen_name.ilike.%${q}%,description.ilike.%${q}%`);
      }
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data.map((row) => this.mapReport(row));
  }

  async create(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'timeline'>, token?: string): Promise<Report> {
    const dbClient = getSupabaseClient(token);
    const reportId = `RBL-MYS-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newReportRow = {
      id: reportId,
      citizen_id: reportData.citizen_id,
      citizen_name: reportData.citizen_name,
      citizen_phone: reportData.citizen_phone || null,
      waste_type: reportData.waste_type,
      estimated_quantity: reportData.estimated_quantity,
      quantity_unit: reportData.quantity_unit,
      description: reportData.description || null,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      address: reportData.address,
      landmark: reportData.landmark || null,
      zone_id: reportData.zone_id || null,
      preferred_pickup_date: reportData.preferred_pickup_date || null,
      preferred_pickup_time_slot: reportData.preferred_pickup_time_slot || null,
      contact_phone: reportData.contact_phone || null,
      pickup_instructions: reportData.pickup_instructions || null,
      status: reportData.status || 'SUBMITTED',
      priority: reportData.priority || 'MEDIUM',
      priority_score: reportData.priority_score ?? 50,
      priority_reasons: reportData.priority_reasons || [],
      assigned_collection_team_id: reportData.assigned_collection_team_id || null,
      assigned_collection_team_name: reportData.assigned_collection_team_name || null,
      created_at: now,
      updated_at: now
    };

    const { error: repErr } = await dbClient.from('reports').insert(newReportRow);
    if (repErr) {
      throw new Error(`Failed to create report in Supabase: ${repErr.message}`);
    }

    // Insert Images
    const insertedImages: ReportImage[] = [];
    if (reportData.images && reportData.images.length > 0) {
      const imgRows = reportData.images.map((img, idx) => ({
        id: img.id || `img-${Date.now()}-${idx}`,
        report_id: reportId,
        image_url: img.image_url,
        thumbnail_url: img.thumbnail_url || null,
        file_size_bytes: img.file_size_bytes || null,
        uploaded_at: img.uploaded_at || now
      }));

      const { data: imgData, error: imgErr } = await dbClient
        .from('report_images')
        .insert(imgRows)
        .select();

      if (!imgErr && imgData) {
        insertedImages.push(...imgData);
      }
    }

    // Insert AI Analysis if present
    let insertedAi: AIAnalysis | undefined = undefined;
    if (reportData.ai_analysis) {
      const aiRow = {
        id: reportData.ai_analysis.id || `ai-${uuidv4().substring(0, 8)}`,
        report_id: reportId,
        waste_composition: reportData.ai_analysis.waste_composition,
        recyclability: reportData.ai_analysis.recyclability,
        image_quality: reportData.ai_analysis.image_quality,
        contamination: reportData.ai_analysis.contamination,
        duplicate_probability: reportData.ai_analysis.duplicate_probability,
        confidence: reportData.ai_analysis.confidence,
        suggested_waste_type: reportData.ai_analysis.suggested_waste_type,
        model_version: reportData.ai_analysis.model_version || 'v1.4',
        analyzed_at: reportData.ai_analysis.analyzed_at || now
      };

      const { data: aiRes, error: aiErr } = await dbClient
        .from('ai_analyses')
        .insert(aiRow)
        .select()
        .maybeSingle();

      if (!aiErr && aiRes) {
        insertedAi = aiRes;
      }
    }

    // Add initial timeline event
    const initialTimeline = await this.addTimelineEvent(reportId, {
      status: 'SUBMITTED',
      actor_id: reportData.citizen_id,
      actor_name: reportData.citizen_name,
      actor_role: 'CITIZEN',
      note: 'Report registered in system with photographic evidence and location details.'
    }, token);

    return {
      ...newReportRow,
      images: insertedImages,
      ai_analysis: insertedAi,
      timeline: [initialTimeline]
    } as Report;
  }

  async update(id: string, updates: Partial<Report>, token?: string): Promise<Report | null> {
    const dbClient = getSupabaseClient(token);
    const patch: any = { updated_at: new Date().toISOString() };

    const allowedFields = [
      'waste_type', 'estimated_quantity', 'quantity_unit', 'description',
      'latitude', 'longitude', 'address', 'landmark', 'zone_id',
      'preferred_pickup_date', 'preferred_pickup_time_slot', 'contact_phone',
      'pickup_instructions', 'status', 'priority', 'priority_score',
      'priority_reasons', 'assigned_collection_team_id', 'assigned_collection_team_name'
    ];

    for (const field of allowedFields) {
      if ((updates as any)[field] !== undefined) {
        patch[field] = (updates as any)[field];
      }
    }

    const { error } = await dbClient.from('reports').update(patch).eq('id', id);
    if (error) {
      throw new Error(`Failed to update report ${id}: ${error.message}`);
    }

    // If verification was updated, upsert report_verifications
    if (updates.verification) {
      const v = updates.verification;
      await dbClient.from('report_verifications').upsert({
        id: v.id || `ver-${uuidv4().substring(0, 8)}`,
        report_id: id,
        status: v.status,
        verified_by: v.verified_by || null,
        verifier_name: v.verifier_name || null,
        notes: v.notes || null,
        flags: v.flags || [],
        duplicate_of_report_id: v.duplicate_of_report_id || null,
        verified_at: v.verified_at || new Date().toISOString()
      });
    }

    // If AI analysis was updated, upsert ai_analyses
    if (updates.ai_analysis) {
      const a = updates.ai_analysis;
      await dbClient.from('ai_analyses').upsert({
        id: a.id || `ai-${uuidv4().substring(0, 8)}`,
        report_id: id,
        waste_composition: a.waste_composition,
        recyclability: a.recyclability,
        image_quality: a.image_quality,
        contamination: a.contamination,
        duplicate_probability: a.duplicate_probability,
        confidence: a.confidence,
        suggested_waste_type: a.suggested_waste_type,
        model_version: a.model_version || 'v1.4',
        analyzed_at: a.analyzed_at || new Date().toISOString()
      });
    }

    return this.findById(id);
  }

  async addTimelineEvent(
    reportId: string,
    event: Omit<TimelineEvent, 'id' | 'report_id' | 'timestamp'>,
    token?: string
  ): Promise<TimelineEvent> {
    const dbClient = getSupabaseClient(token);
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const eventId = `tl-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const row = {
      id: eventId,
      report_id: reportId,
      status: event.status,
      actor_id: event.actor_id,
      actor_user_id: isUuid(event.actor_id) ? event.actor_id : null,
      actor_name: event.actor_name,
      actor_role: event.actor_role,
      note: event.note,
      timestamp: now
    };

    const { error } = await dbClient.from('report_timeline').insert(row);
    if (error) {
      throw new Error(`Failed to add timeline event: ${error.message}`);
    }

    return {
      id: eventId,
      report_id: reportId,
      status: event.status,
      actor_id: event.actor_id,
      actor_name: event.actor_name,
      actor_role: event.actor_role,
      note: event.note,
      timestamp: now
    };
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    return !error;
  }

  private mapReport(row: any): Report {
    const rawImages = row.report_images || [];
    const images: ReportImage[] = rawImages.map((img: any) => ({
      id: img.id,
      report_id: img.report_id,
      image_url: img.image_url,
      thumbnail_url: img.thumbnail_url || undefined,
      file_size_bytes: img.file_size_bytes || undefined,
      uploaded_at: img.uploaded_at
    }));

    const rawAi = Array.isArray(row.ai_analyses) ? row.ai_analyses[0] : row.ai_analyses;
    const ai_analysis: AIAnalysis | undefined = rawAi
      ? {
          id: rawAi.id,
          report_id: rawAi.report_id,
          waste_composition: rawAi.waste_composition,
          recyclability: rawAi.recyclability,
          image_quality: rawAi.image_quality,
          contamination: rawAi.contamination,
          duplicate_probability: rawAi.duplicate_probability,
          confidence: rawAi.confidence,
          suggested_waste_type: rawAi.suggested_waste_type,
          model_version: rawAi.model_version,
          analyzed_at: rawAi.analyzed_at
        }
      : undefined;

    const rawVer = Array.isArray(row.report_verifications) ? row.report_verifications[0] : row.report_verifications;
    const verification: ReportVerification | undefined = rawVer
      ? {
          id: rawVer.id,
          report_id: rawVer.report_id,
          status: rawVer.status,
          verified_by: rawVer.verified_by || undefined,
          verifier_name: rawVer.verifier_name || undefined,
          notes: rawVer.notes || undefined,
          flags: rawVer.flags || [],
          duplicate_of_report_id: rawVer.duplicate_of_report_id || undefined,
          verified_at: rawVer.verified_at || undefined
        }
      : undefined;

    const rawTimeline = row.report_timeline || [];
    const timeline: TimelineEvent[] = rawTimeline
      .map((tl: any) => ({
        id: tl.id,
        report_id: tl.report_id,
        status: tl.status,
        actor_id: tl.actor_id,
        actor_name: tl.actor_name,
        actor_role: tl.actor_role,
        note: tl.note,
        timestamp: tl.timestamp
      }))
      .sort((a: TimelineEvent, b: TimelineEvent) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      id: row.id,
      citizen_id: row.citizen_id,
      citizen_name: row.citizen_name,
      citizen_phone: row.citizen_phone || undefined,
      waste_type: row.waste_type,
      estimated_quantity: row.estimated_quantity,
      quantity_unit: row.quantity_unit,
      description: row.description || undefined,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
      landmark: row.landmark || undefined,
      zone_id: row.zone_id || undefined,
      preferred_pickup_date: row.preferred_pickup_date || undefined,
      preferred_pickup_time_slot: row.preferred_pickup_time_slot || undefined,
      contact_phone: row.contact_phone || undefined,
      pickup_instructions: row.pickup_instructions || undefined,
      status: row.status,
      priority: row.priority,
      priority_score: row.priority_score,
      priority_reasons: row.priority_reasons || [],
      images,
      ai_analysis,
      verification,
      timeline,
      assigned_collection_team_id: row.assigned_collection_team_id || undefined,
      assigned_collection_team_name: row.assigned_collection_team_name || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
