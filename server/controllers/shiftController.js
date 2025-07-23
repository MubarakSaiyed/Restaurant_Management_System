// server/controllers/shiftController.js

import { Op } from 'sequelize';
import Shift    from '../models/shift.js';
import Staff    from '../models/Staff.js';
import {
  requireAuth,
  requireStaff,
  requireAdmin
} from '../middleware/requireAuth.js';

/**
 * GET /api/shifts?weekStart=YYYY-MM-DD
 * — fetch all shifts in that 7-day window
 *   (staff & admin only)
 */
export const getShifts = [
  requireAuth,
  requireStaff,
  async (req, res) => {
    try {
      const { weekStart } = req.query;
      if (!weekStart) {
        return res.status(400).json({ error: 'Missing weekStart (YYYY-MM-DD)' });
      }

      const startDate = new Date(weekStart);
      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid weekStart format' });
      }

      // Compute end of week (6 days after)
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const weekEnd = endDate.toISOString().slice(0, 10);

      const shifts = await Shift.findAll({
        where: {
          date: { [Op.between]: [weekStart, weekEnd] }
        },
        include: [
          {
            model:      Staff,
            as:         'staff',                // must match Shift.belongsTo(Staff, { as: 'staff' })
            attributes: ['id', 'name', 'role']
          }
        ],
        order: [
          ['date',      'ASC'],
          ['startTime', 'ASC']
        ]
      });

      return res.json(shifts);
    } catch (err) {
      console.error('❌ getShifts error:', err);
      return res.status(500).json({ error: 'Could not fetch shifts' });
    }
  }
];

/**
 * POST /api/shifts
 * Body: { staffId, date, startTime, endTime }
 * — create a new shift (admin only)
 */
export const createShift = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { staffId, date, startTime, endTime } = req.body;
      if (!staffId || !date || !startTime || !endTime) {
        return res.status(400).json({
          error: 'staffId, date, startTime & endTime are all required'
        });
      }

      // ensure the staff member exists
      const staff = await Staff.findByPk(staffId);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Persist shift.userId = staffId
      const shift = await Shift.create({ userId: staffId, date, startTime, endTime });
      return res.status(201).json(shift);
    } catch (err) {
      console.error('❌ createShift error:', err);
      return res.status(500).json({ error: 'Could not create shift' });
    }
  }
];

/**
 * PUT /api/shifts/:id
 * Body: { date?, startTime?, endTime? }
 * — update an existing shift (admin only)
 */
export const updateShift = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const shift = await Shift.findByPk(req.params.id);
      if (!shift) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      await shift.update(req.body);
      return res.json(shift);
    } catch (err) {
      console.error('❌ updateShift error:', err);
      return res.status(500).json({ error: 'Could not update shift' });
    }
  }
];

/**
 * DELETE /api/shifts/:id
 * — remove a shift (admin only)
 */
export const deleteShift = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const shift = await Shift.findByPk(req.params.id);
      if (!shift) {
        return res.status(404).json({ error: 'Shift not found' });
      }
      await shift.destroy();
      return res.json({ success: true });
    } catch (err) {
      console.error('❌ deleteShift error:', err);
      return res.status(500).json({ error: 'Could not delete shift' });
    }
  }
];
