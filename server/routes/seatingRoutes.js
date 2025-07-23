import express                       from 'express';
import Table                         from '../models/Table.js';
import {
  getSeatingChart,
  loadTablesWithStatus
} from '../controllers/seatingController.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';

const router = express.Router();

// ── Public GET: list today's tables + status ───────────────────────
router.get('/', getSeatingChart);

// ── Admin-only PATCH: update a table’s status ─────────────────────
router.patch(
  '/:tableId/status',
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { tableId } = req.params;
      const { status }  = req.body;

      // 1) Validate new status
      if (!['available','reserved','occupied'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // 2) Lookup & update
      const table = await Table.findByPk(tableId);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }
      await table.update({ status });

      // 3) Broadcast fresh seating payload
      const io = req.app.get('io');
      if (io) {
        const payload = await loadTablesWithStatus();
        io.emit('seating:update', payload);
      }

      return res.json({ message: 'Status updated' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
