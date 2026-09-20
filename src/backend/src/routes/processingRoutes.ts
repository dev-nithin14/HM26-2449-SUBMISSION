import { Router } from 'express';
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  getProducts,
  createProduct
} from '../controllers/processingController.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getBatches);
router.post('/', requireRole(['PROCESSING_TEAM', 'ADMIN']), createBatch);
router.get('/products', getProducts);
router.post('/products', requireRole(['PROCESSING_TEAM', 'ADMIN']), createProduct);
router.get('/:id', getBatchById);
router.patch('/:id', requireRole(['PROCESSING_TEAM', 'ADMIN']), updateBatch);

export default router;
