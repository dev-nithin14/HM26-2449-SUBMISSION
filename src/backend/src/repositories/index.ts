import {
  IUserRepository,
  IReportRepository,
  ICollectionRepository,
  IProcessingRepository,
  IAnalyticsRepository,
  INotificationRepository
} from './interfaces/index.js';
import {
  SupabaseUserRepository,
  SupabaseReportRepository,
  SupabaseCollectionRepository,
  SupabaseProcessingRepository,
  SupabaseAnalyticsRepository,
  SupabaseNotificationRepository
} from './supabase/index.js';

// Central Repository Container backed strictly by Supabase PostgreSQL.
// Silent mock fallback is completely disabled. Supabase is the sole source of truth.
export const userRepository: IUserRepository = new SupabaseUserRepository();
export const reportRepository: IReportRepository = new SupabaseReportRepository();
export const collectionRepository: ICollectionRepository = new SupabaseCollectionRepository();
export const processingRepository: IProcessingRepository = new SupabaseProcessingRepository();
export const analyticsRepository: IAnalyticsRepository = new SupabaseAnalyticsRepository();
export const notificationRepository: INotificationRepository = new SupabaseNotificationRepository();

export * from './interfaces/index.js';
