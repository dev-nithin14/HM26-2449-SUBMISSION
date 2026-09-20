import { v4 as uuidv4 } from 'uuid';
import { ICollectionRepository } from '../interfaces/index.js';
import {
  CollectionTeam,
  CollectionAssignment,
  CollectionProof,
  JurisdictionZone,
  Report
} from '../../types/index.js';
import { supabase, getSupabaseClient } from '../../lib/supabase.js';

export class SupabaseCollectionRepository implements ICollectionRepository {
  async findAllTeams(): Promise<CollectionTeam[]> {
    const { data: teams, error: tErr } = await supabase
      .from('collection_teams')
      .select('*, team_zones(zone_id)');

    if (tErr || !teams) return [];

    // Query active assignments to calculate active counts
    const { data: activeAssignments } = await supabase
      .from('collection_assignments')
      .select('collection_team_id')
      .in('status', ['PENDING', 'ACCEPTED', 'IN_TRANSIT']);

    const activeCounts: Record<string, number> = {};
    activeAssignments?.forEach((a) => {
      activeCounts[a.collection_team_id] = (activeCounts[a.collection_team_id] || 0) + 1;
    });

    return teams.map((t: any) => ({
      id: t.id,
      team_name: t.team_name,
      lead_driver_name: t.lead_driver_name,
      contact_number: t.contact_number,
      vehicle_number: t.vehicle_number,
      vehicle_capacity_tons: t.vehicle_capacity_tons,
      zone_coverage: (t.team_zones || []).map((tz: any) => tz.zone_id),
      is_available: t.is_available,
      current_active_assignments: activeCounts[t.id] || 0
    }));
  }

  async findTeamById(id: string): Promise<CollectionTeam | null> {
    const { data: team, error } = await supabase
      .from('collection_teams')
      .select('*, team_zones(zone_id)')
      .eq('id', id)
      .maybeSingle();

    if (error || !team) return null;

    const { count } = await supabase
      .from('collection_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('collection_team_id', id)
      .in('status', ['PENDING', 'ACCEPTED', 'IN_TRANSIT']);

    return {
      id: team.id,
      team_name: team.team_name,
      lead_driver_name: team.lead_driver_name,
      contact_number: team.contact_number,
      vehicle_number: team.vehicle_number,
      vehicle_capacity_tons: team.vehicle_capacity_tons,
      zone_coverage: (team.team_zones || []).map((tz: any) => tz.zone_id),
      is_available: team.is_available,
      current_active_assignments: count || 0
    };
  }

  async findAllAssignments(teamId?: string, token?: string): Promise<CollectionAssignment[]> {
    const dbClient = getSupabaseClient(token);
    let query = dbClient
      .from('collection_assignments')
      .select('*, collection_proofs(*), reports(*, report_images(*))')
      .order('assigned_at', { ascending: false });

    if (teamId) {
      query = query.eq('collection_team_id', teamId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row: any) => this.mapAssignment(row));
  }

  async findAssignmentById(id: string, token?: string): Promise<CollectionAssignment | null> {
    const dbClient = getSupabaseClient(token);
    const { data, error } = await dbClient
      .from('collection_assignments')
      .select('*, collection_proofs(*), reports(*, report_images(*))')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapAssignment(data);
  }

  async findAssignmentByReportId(reportId: string): Promise<CollectionAssignment | null> {
    const { data, error } = await supabase
      .from('collection_assignments')
      .select('*, collection_proofs(*), reports(*, report_images(*))')
      .eq('report_id', reportId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapAssignment(data);
  }

  async createAssignment(
    assignmentData: Omit<CollectionAssignment, 'id' | 'assigned_at'>,
    token?: string
  ): Promise<CollectionAssignment> {
    const dbClient = getSupabaseClient(token);
    const id = `ASG-MYS-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const row = {
      id,
      report_id: assignmentData.report_id,
      collection_team_id: assignmentData.collection_team_id,
      collection_team_name: assignmentData.collection_team_name,
      status: assignmentData.status || 'PENDING',
      assigned_by: isUuid(assignmentData.assigned_by) ? assignmentData.assigned_by : null,
      assigned_at: now,
      accepted_at: assignmentData.accepted_at || null,
      started_at: assignmentData.started_at || null,
      completed_at: assignmentData.completed_at || null,
      distance_km: assignmentData.distance_km || 5.0
    };

    const { error } = await dbClient.from('collection_assignments').insert(row);
    if (error) {
      throw new Error(`Failed to create collection assignment: ${error.message}`);
    }

    const created = await this.findAssignmentById(id, token);
    if (!created) {
      throw new Error('Failed to retrieve newly created assignment');
    }
    return created;
  }

  async updateAssignment(
    id: string,
    updates: Partial<CollectionAssignment>,
    token?: string
  ): Promise<CollectionAssignment | null> {
    const dbClient = getSupabaseClient(token);
    const patch: any = {};
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.accepted_at !== undefined) patch.accepted_at = updates.accepted_at;
    if (updates.started_at !== undefined) patch.started_at = updates.started_at;
    if (updates.completed_at !== undefined) patch.completed_at = updates.completed_at;
    if (updates.distance_km !== undefined) patch.distance_km = updates.distance_km;

    const { error } = await dbClient.from('collection_assignments').update(patch).eq('id', id);
    if (error) {
      throw new Error(`Failed to update assignment ${id}: ${error.message}`);
    }

    return this.findAssignmentById(id, token);
  }

  async submitProof(
    assignmentId: string,
    proofData: Omit<CollectionProof, 'id' | 'assignment_id' | 'recorded_at'>,
    token?: string
  ): Promise<CollectionProof> {
    const dbClient = getSupabaseClient(token);
    const id = `prf-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const proofRow = {
      id,
      assignment_id: assignmentId,
      photo_url: proofData.photo_url,
      verified_weight_kg: proofData.verified_weight_kg,
      gps_latitude: proofData.gps_latitude,
      gps_longitude: proofData.gps_longitude,
      driver_notes: proofData.driver_notes || null,
      recorded_at: now
    };

    const { error: pErr } = await dbClient.from('collection_proofs').insert(proofRow);
    if (pErr) {
      throw new Error(`Failed to submit collection proof: ${pErr.message}`);
    }

    // Update assignment to COLLECTED
    await dbClient
      .from('collection_assignments')
      .update({ status: 'COLLECTED', completed_at: now })
      .eq('id', assignmentId);

    return {
      id,
      assignment_id: assignmentId,
      photo_url: proofData.photo_url,
      verified_weight_kg: proofData.verified_weight_kg,
      gps_latitude: proofData.gps_latitude,
      gps_longitude: proofData.gps_longitude,
      driver_notes: proofData.driver_notes,
      recorded_at: now
    };
  }

  async findAllZones(): Promise<JurisdictionZone[]> {
    const { data: zones, error } = await supabase
      .from('jurisdiction_zones')
      .select('*, team_zones(team_id)')
      .order('id', { ascending: true });

    if (error || !zones) return [];

    return zones.map((z: any) => ({
      id: z.id,
      zone_name: z.zone_name,
      zone_code: z.zone_code,
      description: z.description || '',
      center_lat: z.center_lat,
      center_lng: z.center_lng,
      radius_km: z.radius_km,
      assigned_team_ids: (z.team_zones || []).map((tz: any) => tz.team_id)
    }));
  }

  async findZoneById(id: string): Promise<JurisdictionZone | null> {
    const { data: z, error } = await supabase
      .from('jurisdiction_zones')
      .select('*, team_zones(team_id)')
      .eq('id', id)
      .maybeSingle();

    if (error || !z) return null;

    return {
      id: z.id,
      zone_name: z.zone_name,
      zone_code: z.zone_code,
      description: z.description || '',
      center_lat: z.center_lat,
      center_lng: z.center_lng,
      radius_km: z.radius_km,
      assigned_team_ids: (z.team_zones || []).map((tz: any) => tz.team_id)
    };
  }

  private mapAssignment(row: any): CollectionAssignment {
    const rawProof = Array.isArray(row.collection_proofs) ? row.collection_proofs[0] : row.collection_proofs;
    const proof: CollectionProof | undefined = rawProof
      ? {
          id: rawProof.id,
          assignment_id: rawProof.assignment_id,
          photo_url: rawProof.photo_url,
          verified_weight_kg: rawProof.verified_weight_kg,
          gps_latitude: rawProof.gps_latitude,
          gps_longitude: rawProof.gps_longitude,
          driver_notes: rawProof.driver_notes || undefined,
          recorded_at: rawProof.recorded_at
        }
      : undefined;

    let report: Report | undefined = undefined;
    if (row.reports) {
      const r = row.reports;
      report = {
        id: r.id,
        citizen_id: r.citizen_id,
        citizen_name: r.citizen_name,
        citizen_phone: r.citizen_phone || undefined,
        waste_type: r.waste_type,
        estimated_quantity: r.estimated_quantity,
        quantity_unit: r.quantity_unit,
        description: r.description || undefined,
        latitude: r.latitude,
        longitude: r.longitude,
        address: r.address,
        landmark: r.landmark || undefined,
        zone_id: r.zone_id || undefined,
        status: r.status,
        priority: r.priority,
        priority_score: r.priority_score,
        priority_reasons: r.priority_reasons || [],
        images: (r.report_images || []).map((img: any) => ({
          id: img.id,
          report_id: img.report_id,
          image_url: img.image_url,
          thumbnail_url: img.thumbnail_url || undefined,
          uploaded_at: img.uploaded_at
        })),
        timeline: [],
        created_at: r.created_at,
        updated_at: r.updated_at
      };
    }

    return {
      id: row.id,
      report_id: row.report_id,
      report,
      collection_team_id: row.collection_team_id,
      collection_team_name: row.collection_team_name,
      status: row.status,
      assigned_by: row.assigned_by || 'admin',
      assigned_at: row.assigned_at,
      accepted_at: row.accepted_at || undefined,
      started_at: row.started_at || undefined,
      completed_at: row.completed_at || undefined,
      distance_km: row.distance_km || 5.0,
      proof
    };
  }
}
