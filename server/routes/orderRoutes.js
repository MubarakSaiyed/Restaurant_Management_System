// server/routes/orderRoutes.js
import express from 'express';
import {
  getAllOrders,
  getMyOrders as getorders,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { requireAuth, requireStaff } from '../middleware/requireAuth.js';

const router = express.Router();

// Admin & staff view all
router.get('/',    requireAuth, requireStaff, getAllOrders);
// Customer view their own
router.get('/my',  requireAuth,               getorders);
// Place a new order
router.post('/',   requireAuth,               createOrder);
// Update status (admin/staff)
router.put('/:id', requireAuth, requireStaff, updateOrderStatus);
// Cancel an order (customer or staff)
router.delete('/:id', requireAuth, cancelOrder);

export default router;
