import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  updateAssignment,
  submitCollectionProof,
  getTeams,
  getZones
} from '../controllers/collectionController.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getAssignments);
router.get('/teams', getTeams);
router.get('/zones', getZones);
router.get('/:id', getAssignmentById);
router.patch('/:id', requireRole(['COLLECTION_TEAM', 'ADMIN']), updateAssignment);
router.post('/:id/proof', requireRole(['COLLECTION_TEAM', 'ADMIN']), submitCollectionProof);

export default router;
