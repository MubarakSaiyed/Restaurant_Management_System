// server/routes/feedbackRoutes.js
import express from 'express';
import {
  leaveFeedback
} from '../controllers/feedbackController.js';
import {
  getLoyalty,
  redeemLoyalty
} from '../controllers/loyaltyController.js';

const router = express.Router();

router.post('/feedback',         leaveFeedback);
router.get ('/loyalty',          getLoyalty);
router.post('/loyalty/redeem',   redeemLoyalty);

export default router;
