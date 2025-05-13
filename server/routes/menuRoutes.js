import express from 'express';
import {
  getMenus,
  addMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menuController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// GET /api/menu      ← any authenticated user
router.get('/', requireAuth, getMenus);

// POST /api/menu     ← only admins
router.post('/', requireAuth, requireAdmin, addMenu);

// PUT /api/menu/:id  ← only admins
router.put('/:id', requireAuth, requireAdmin, updateMenu);

// DELETE /api/menu/:id ← only admins
router.delete('/:id', requireAuth, requireAdmin, deleteMenu);

export default router;
