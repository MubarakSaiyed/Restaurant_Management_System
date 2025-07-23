// server/routes/staffRoutes.js
import express from 'express';
import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staffController.js';
import { requireAuth }  from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAuth.js';

const router = express.Router();

// All of these are admin‐only
router.get('/',    requireAuth, requireAdmin, getAllStaff);
router.post('/',   requireAuth, requireAdmin, addStaff);
router.put('/:id', requireAuth, requireAdmin, updateStaff);
router.delete('/:id', requireAuth, requireAdmin, deleteStaff);

export default router;
