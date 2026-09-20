import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { notificationRepository } from '../repositories/index.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }
    const userId = req.user.id;
    const notifications = await notificationRepository.findByUserId(userId);
    return res.json({
      success: true,
      data: notifications
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_NOTIFICATIONS_FAILED', message: err.message }
    });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const ok = await notificationRepository.markAsRead(id);
    return res.json({
      success: true,
      data: { id, read: ok }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'MARK_READ_FAILED', message: err.message }
    });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }
    const userId = req.user.id;
    const ok = await notificationRepository.markAllAsRead(userId);
    return res.json({
      success: true,
      data: { readAll: ok }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'MARK_ALL_READ_FAILED', message: err.message }
    });
  }
}
