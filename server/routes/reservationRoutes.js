// server/routes/reservationRoutes.js

import express from 'express';
import {
  getReservations,
  addReservation,
  updateReservation,
  deleteReservation
} from '../controllers/reservationController.js';
import { requireAuth, requireStaff } from '../middleware/requireAuth.js';

const router = express.Router();

// Public: anyone can book
router.post('/', addReservation);

// Staff/Admin: manage existing
router.get(   '/',      requireAuth, requireStaff, getReservations);
router.put(   '/:id',   requireAuth, requireStaff, updateReservation);
router.delete('/:id',   requireAuth, requireStaff, deleteReservation);

export default router;
