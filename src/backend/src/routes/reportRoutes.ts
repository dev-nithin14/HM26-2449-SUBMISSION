import { Router } from 'express';
import {
  getReports,
  createReport,
  getReportById,
  updateReport,
  analyzeReport,
  getReportAnalysis,
  verifyReport,
  calculatePriority,
  getReportRouting,
  assignReport
} from '../controllers/reportController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getReports);
router.post('/', requireAuth, createReport);
router.get('/:id', getReportById);
router.patch('/:id', requireAuth, updateReport);

router.post('/:id/analyze', analyzeReport);
router.get('/:id/analysis', getReportAnalysis);

router.post('/:id/verify', requireRole(['ADMIN']), verifyReport);
router.post('/:id/calculate-priority', calculatePriority);

router.get('/:id/routing', getReportRouting);
router.post('/:id/assign', requireRole(['ADMIN']), assignReport);

export default router;
