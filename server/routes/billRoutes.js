import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  splitBill,
  getBill,
  payBillShare
} from '../controllers/billController.js';

const router = express.Router();

// Must be logged in (owner of order) to create/get
router.use(requireAuth);

// Split the bill for a given order
router.post('/:orderId/split', splitBill);

// Fetch all shares for an order
router.get('/:orderId', getBill);

// Mark a share as paid
router.post('/:billId/pay', payBillShare);

export default router;
