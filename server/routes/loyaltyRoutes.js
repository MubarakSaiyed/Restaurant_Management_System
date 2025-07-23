// server/routes/loyaltyRoutes.js
import express from 'express';
import { getLoyalty, redeemLoyalty } from '../controllers/loyaltyController.js';

const router = express.Router();

/**
 * GET  /api/loyalty?guestCode=XYZ123
 * POST /api/loyalty/redeem
 *    body: { guestCode, pointsToRedeem }
 */
router.get('/loyalty',    getLoyalty);
router.post('/loyalty/redeem', redeemLoyalty);

export default router;
