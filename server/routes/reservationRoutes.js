import express from 'express';
import {
  getReservations,
  addReservation,
  updateReservation,
  deleteReservation
} from '../controllers/reservationController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// POST /api/reservations      ← any authenticated user (customer or admin)
router.post('/', requireAuth, addReservation);

// GET /api/reservations       ← admin only
router.get('/', requireAuth, requireAdmin, getReservations);

// PUT /api/reservations/:id   ← admin only
router.put('/:id', requireAuth, requireAdmin, updateReservation);

// DELETE /api/reservations/:id ← admin only
router.delete('/:id', requireAuth, requireAdmin, deleteReservation);

export default router;
