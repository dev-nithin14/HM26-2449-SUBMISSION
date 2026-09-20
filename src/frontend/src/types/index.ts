export type UserRole = 'CITIZEN' | 'BUILDER' | 'COLLECTION_TEAM' | 'PROCESSING_TEAM' | 'ADMIN';

export type ReportStatus =
  | 'SUBMITTED'
  | 'AI_ANALYZED'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'COLLECTED'
  | 'SORTING'
  | 'PROCESSING'
  | 'RECYCLED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'CANCELLED';

export type WasteType = 'CONCRETE' | 'BRICKS' | 'TILES' | 'SOIL' | 'MIXED' | 'OTHER';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'POSSIBLE_DUPLICATE';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReportImage {
  id: string;
  report_id: string;
  image_url: string;
  thumbnail_url?: string;
  file_size_bytes?: number;
  uploaded_at: string;
}

export interface WasteComposition {
  concrete_percentage: number;
  bricks_percentage: number;
  tiles_percentage: number;
  soil_percentage: number;
  other_percentage: number;
}

export interface AIAnalysis {
  id: string;
  report_id: string;
  waste_composition: WasteComposition;
  recyclability: 'HIGH' | 'MEDIUM' | 'LOW';
  image_quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  contamination: 'LOW' | 'MODERATE' | 'HIGH';
  duplicate_probability: number;
  confidence: number;
  suggested_waste_type: WasteType;
  model_version: string;
  analyzed_at: string;
}

export interface ReportVerification {
  id: string;
  report_id: string;
  status: VerificationStatus;
  verified_by?: string;
  verifier_name?: string;
  notes?: string;
  flags: string[];
  duplicate_of_report_id?: string;
  verified_at?: string;
}

export interface TimelineEvent {
  id: string;
  report_id: string;
  status: ReportStatus;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  note: string;
  timestamp: string;
}

export interface Report {
  id: string;
  citizen_id: string;
  citizen_name: string;
  citizen_phone?: string;
  waste_type: WasteType;
  estimated_quantity: number;
  quantity_unit: 'kg' | 'tons';
  description?: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  zone_id?: string;
  preferred_pickup_date?: string;
  preferred_pickup_time_slot?: string;
  contact_phone?: string;
  pickup_instructions?: string;
  status: ReportStatus;
  priority: PriorityLevel;
  priority_score: number;
  priority_reasons: string[];
  images: ReportImage[];
  ai_analysis?: AIAnalysis;
  verification?: ReportVerification;
  timeline: TimelineEvent[];
  assigned_collection_team_id?: string;
  assigned_collection_team_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionTeam {
  id: string;
  team_name: string;
  lead_driver_name: string;
  contact_number: string;
  vehicle_number: string;
  vehicle_capacity_tons: number;
  zone_coverage: string[];
  is_available: boolean;
  current_active_assignments: number;
}

export interface CollectionProof {
  id: string;
  assignment_id: string;
  photo_url: string;
  verified_weight_kg: number;
  gps_latitude: number;
  gps_longitude: number;
  driver_notes?: string;
  recorded_at: string;
}

export interface CollectionAssignment {
  id: string;
  report_id: string;
  report?: Report;
  collection_team_id: string;
  collection_team_name: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COLLECTED' | 'CANCELLED';
  assigned_by: string;
  assigned_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  distance_km?: number;
  proof?: CollectionProof;
}

export interface ProcessingBatch {
  id: string;
  source_report_ids: string[];
  intake_quantity_kg: number;
  material_type: WasteType;
  status: 'INTAKE' | 'SORTING' | 'RECOVERY' | 'COMPLETED';
  recovered_quantity_kg: number;
  rejected_quantity_kg: number;
  recovery_rate_percentage: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  processed_by_name: string;
  notes?: string;
  source_reports?: Report[];
  recycled_products?: RecycledProduct[];
}

export interface RecycledProduct {
  id: string;
  batch_id: string;
  product_name: 'Recycled Paver' | 'Recycled Construction Block' | 'Coarse Aggregate' | 'Manufactured Sand';
  units_produced: number;
  unit_of_measure: 'units' | 'sq_meters' | 'tons';
  recycled_content_percentage: number;
  dimensions_mm?: string;
  prototype_unit_cost_inr: number;
  intended_application: string;
  production_status: 'PROTOTYPE' | 'PILOT' | 'COMMERCIAL_READY';
  manufactured_at: string;
}

export interface JurisdictionZone {
  id: string;
  zone_name: string;
  zone_code: string;
  description: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  assigned_team_ids: string[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  report_id?: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED';
  read: boolean;
  created_at: string;
}

export interface ImpactMetrics {
  total_waste_diverted_kg: number;
  total_waste_diverted_tons: number;
  total_landfill_saved_cubic_meters: number;
  total_co2_offset_kg: number;
  total_recycled_pavers_produced: number;
  total_recycled_blocks_produced: number;
  active_reports_count: number;
  completed_reports_count: number;
  citizen_participation_count: number;
  avg_resolution_time_hours: number;
  last_updated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
