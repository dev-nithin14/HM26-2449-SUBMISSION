import { v4 as uuidv4 } from 'uuid';
import { INotificationRepository } from '../interfaces/index.js';
import { NotificationItem } from '../../types/index.js';
import { supabase } from '../../lib/supabase.js';

export class SupabaseNotificationRepository implements INotificationRepository {
  async findByUserId(userId: string): Promise<NotificationItem[]> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (isUuid(userId)) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((n: any) => ({
      id: n.id,
      user_id: n.user_id || 'all',
      title: n.title,
      message: n.message,
      report_id: n.report_id || undefined,
      type: n.type,
      read: n.read,
      created_at: n.created_at
    }));
  }

  async create(
    notificationData: Omit<NotificationItem, 'id' | 'created_at'>
  ): Promise<NotificationItem> {
    const id = `notif-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    let targetUserId: string | null = null;

    if (isUuid(notificationData.user_id)) {
      targetUserId = notificationData.user_id;
    } else if (notificationData.user_id === 'usr-adm-01') {
      targetUserId = 'a0000000-0000-0000-0000-000000000001';
    } else if (notificationData.user_id === 'usr-prc-01') {
      targetUserId = 'e0000000-0000-0000-0000-000000000001';
    } else if (notificationData.user_id === 'usr-col-01') {
      targetUserId = 'd0000000-0000-0000-0000-000000000001';
    }

    const row = {
      id,
      user_id: targetUserId,
      title: notificationData.title,
      message: notificationData.message,
      report_id: notificationData.report_id || null,
      type: notificationData.type || 'INFO',
      read: notificationData.read ?? false,
      created_at: now
    };

    const { error } = await supabase.from('notifications').insert(row);
    if (error) {
      console.warn(`[NotificationRepository] Non-fatal notice: Failed to insert notification: ${error.message}`);
    }

    return {
      id,
      user_id: notificationData.user_id,
      title: notificationData.title,
      message: notificationData.message,
      report_id: notificationData.report_id,
      type: notificationData.type,
      read: row.read,
      created_at: now
    };
  }

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    return !error;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    let query = supabase.from('notifications').update({ read: true });

    if (isUuid(userId)) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { error } = await query;
    return !error;
  }
}
