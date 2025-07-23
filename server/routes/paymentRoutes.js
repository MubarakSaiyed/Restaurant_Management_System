// server/routes/paymentRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { createPaymentIntent, handleWebhook } from '../controllers/paymentController.js';

const router = express.Router();

/**
 * POST /api/payments/create-payment-intent
 * — Client (must be logged in) requests a new PaymentIntent clientSecret
 */
router.post(
  '/create-payment-intent',
  requireAuth,           // ensure req.user is set
  express.json(),        // parse JSON body
  createPaymentIntent
);

// NOTE: the /webhook endpoint is mounted raw in server.js
export default router;
export { handleWebhook };
