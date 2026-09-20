import {
  UserProfile,
  Report,
  ReportStatus,
  TimelineEvent,
  CollectionTeam,
  CollectionAssignment,
  CollectionProof,
  ProcessingBatch,
  RecycledProduct,
  NotificationItem,
  ImpactMetrics,
  JurisdictionZone
} from '../../types/index.js';

export interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByEmail(email: string): Promise<UserProfile | null>;
  findAll(): Promise<UserProfile[]>;
}

export interface ReportFilterOptions {
  status?: ReportStatus;
  waste_type?: string;
  priority?: string;
  zone_id?: string;
  citizen_id?: string;
  search?: string;
}

export interface IReportRepository {
  findById(id: string): Promise<Report | null>;
  findAll(filters?: ReportFilterOptions): Promise<Report[]>;
  create(report: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'timeline'>, token?: string): Promise<Report>;
  update(id: string, updates: Partial<Report>, token?: string): Promise<Report | null>;
  addTimelineEvent(reportId: string, event: Omit<TimelineEvent, 'id' | 'report_id' | 'timestamp'>, token?: string): Promise<TimelineEvent>;
  delete(id: string): Promise<boolean>;
}

export interface ICollectionRepository {
  findAllTeams(): Promise<CollectionTeam[]>;
  findTeamById(id: string): Promise<CollectionTeam | null>;
  findAllAssignments(teamId?: string, token?: string): Promise<CollectionAssignment[]>;
  findAssignmentById(id: string, token?: string): Promise<CollectionAssignment | null>;
  findAssignmentByReportId(reportId: string): Promise<CollectionAssignment | null>;
  createAssignment(assignment: Omit<CollectionAssignment, 'id' | 'assigned_at'>, token?: string): Promise<CollectionAssignment>;
  updateAssignment(id: string, updates: Partial<CollectionAssignment>, token?: string): Promise<CollectionAssignment | null>;
  submitProof(assignmentId: string, proof: Omit<CollectionProof, 'id' | 'assignment_id' | 'recorded_at'>, token?: string): Promise<CollectionProof>;
  findAllZones(): Promise<JurisdictionZone[]>;
  findZoneById(id: string): Promise<JurisdictionZone | null>;
}

export interface IProcessingRepository {
  findAllBatches(token?: string): Promise<ProcessingBatch[]>;
  findBatchById(id: string, token?: string): Promise<ProcessingBatch | null>;
  createBatch(batch: Omit<ProcessingBatch, 'id' | 'created_at' | 'updated_at' | 'recovery_rate_percentage'>, token?: string): Promise<ProcessingBatch>;
  updateBatch(id: string, updates: Partial<ProcessingBatch>, token?: string): Promise<ProcessingBatch | null>;
  findAllProducts(token?: string): Promise<RecycledProduct[]>;
  createProduct(product: Omit<RecycledProduct, 'id' | 'manufactured_at'>, token?: string): Promise<RecycledProduct>;
}

export interface IAnalyticsRepository {
  getOverviewMetrics(): Promise<Record<string, any>>;
  getWasteDistribution(): Promise<Record<string, number>>;
  getStatusDistribution(): Promise<Record<string, number>>;
  getHotspots(): Promise<any[]>;
  getImpactMetrics(): Promise<ImpactMetrics>;
  getMonthlyTrends(): Promise<any[]>;
}

export interface INotificationRepository {
  findByUserId(userId: string): Promise<NotificationItem[]>;
  create(notification: Omit<NotificationItem, 'id' | 'created_at'>): Promise<NotificationItem>;
  markAsRead(id: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
}
