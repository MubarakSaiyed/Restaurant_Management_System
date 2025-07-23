// server/routes/reportRoutes.js
import express from 'express';
import { requireAuth, requireStaff } from '../middleware/requireAuth.js';
import {
  getSalesOverTime,
  getInventoryTrends,
  getStaffKPIs
} from '../controllers/reportController.js';

const router = express.Router();

// every report is staff/admin only
router.use(requireAuth, requireStaff);

// GET /api/reports/sales?days=7
router.get('/sales', getSalesOverTime);

// GET /api/reports/inventory-trends
router.get('/inventory-trends', getInventoryTrends);

// GET /api/reports/staff-kpis
router.get('/staff-kpis', getStaffKPIs);

export default router;
