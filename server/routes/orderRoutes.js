// server/routes/orderRoutes.js
import express            from 'express';
import {
  getAllOrders,
  getMyOrders,
  createOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { requireAuth }    from '../middleware/requireAuth.js';
import { requireAdmin }   from '../middleware/requireAdmin.js';

const router = express.Router();

// Admins: view every order
router.get('/',      requireAuth, requireAdmin, getAllOrders);

// Any logged-in user: view their own orders
router.get('/my',    requireAuth,               getMyOrders);

// Any logged-in user: place a new order
router.post('/',     requireAuth,               createOrder);

// Admins: update order status
router.put('/:id',   requireAuth, requireAdmin, updateOrderStatus);

export default router;
