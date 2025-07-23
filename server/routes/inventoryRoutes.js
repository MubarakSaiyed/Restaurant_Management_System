// server/routes/inventoryRoutes.js
import express from 'express';
import {
  listInventory,
  updateInventory
} from '../controllers/inventoryController.js';
import { requireAuth, requireStaff } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/inventory        → list all menu items & stock
// PUT /api/inventory/:id    → update stock for a given item
router
  .route('/')
  .get(requireAuth, requireStaff, listInventory);

router
  .route('/:id')
  .put(requireAuth, requireStaff, updateInventory);

export default router;
