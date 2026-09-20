import { Router } from 'express';
import { getMe, inviteStaffUser, getStaffUsers } from '../controllers/authController.js';
import { requireRole, requireAuth } from '../middleware/auth.js';

const router = Router();

// Retrieve current authenticated user profile
router.get('/me', getMe);

// Admin-only staff management endpoints
router.get('/staff', requireRole(['ADMIN']), getStaffUsers);
router.post('/invite-staff', requireRole(['ADMIN']), inviteStaffUser);

export default router;
