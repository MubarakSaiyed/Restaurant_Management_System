// server/controllers/staffController.js

import Staff from '../models/Staff.js';    // default import

/**
 * GET /api/staff
 */
export async function getAllStaff(req, res) {
  try {
    const staffList = await Staff.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(staffList);
  } catch (err) {
    console.error('❌ getAllStaff error:', err);
    return res.status(500).json({ message: 'Could not fetch staff' });
  }
}

/**
 * POST /api/staff
 */
export async function addStaff(req, res) {
  try {
    const newMember = await Staff.create({
      name:       req.body.name,
      role:       req.body.role,
      shiftStart: req.body.shiftStart,
      shiftEnd:   req.body.shiftEnd,
      wage:       req.body.wage
    });
    return res.status(201).json(newMember);
  } catch (err) {
    console.error('❌ addStaff error:', err);
    return res.status(500).json({ message: 'Could not add staff' });
  }
}

/**
 * PUT /api/staff/:id
 */
export async function updateStaff(req, res) {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await staff.update({
      name:       req.body.name,
      role:       req.body.role,
      shiftStart: req.body.shiftStart,
      shiftEnd:   req.body.shiftEnd,
      wage:       req.body.wage
    });

    return res.json(staff);
  } catch (err) {
    console.error('❌ updateStaff error:', err);
    return res.status(500).json({ message: 'Could not update staff' });
  }
}

/**
 * DELETE /api/staff/:id
 */
export async function deleteStaff(req, res) {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await staff.destroy();
    return res.json({ message: 'Staff deleted' });
  } catch (err) {
    console.error('❌ deleteStaff error:', err);
    return res.status(500).json({ message: 'Could not delete staff' });
  }
}
