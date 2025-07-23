// server/controllers/staffController.js
import Staff from '../models/Staff.js';

/**
 * GET /api/staff
 * List all staff members (admin/staff-only endpoint).
 */
export async function getAllStaff(req, res) {
  try {
    // pick only the real columns in your `staff` table:
    const list = await Staff.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'shiftStart',
        'shiftEnd',
        'wage'
      ],
      order: [['name', 'ASC']]
    });

    return res.json(list);
  } catch (err) {
    console.error('❌ getAllStaff error:', err);
    return res.status(500).json({
      message: 'Could not fetch staff',
      detail: err.message
    });
  }
}

/**
 * POST /api/staff
 * Create a new staff member.
 */
export async function addStaff(req, res) {
  try {
    const { name, email, phone, role, shiftStart, shiftEnd, wage } = req.body;

    // require core fields
    if (!name || !email || !phone || !role) {
      return res
        .status(400)
        .json({ message: 'name, email, phone & role are required' });
    }

    const newStaff = await Staff.create({
      name,
      email,
      phone,
      role,
      shiftStart: shiftStart || null,
      shiftEnd:   shiftEnd   || null,
      wage:       wage       || null
    });

    return res.status(201).json(newStaff);
  } catch (err) {
    console.error('❌ addStaff error:', err);

    // handle unique email violation
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use' });
    }

    return res.status(500).json({ message: 'Could not add staff', detail: err.message });
  }
}

/**
 * PUT /api/staff/:id
 * Update an existing staff member.
 */
export async function updateStaff(req, res) {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const { name, email, phone, role, shiftStart, shiftEnd, wage } = req.body;
    if (!name || !email || !phone || !role) {
      return res
        .status(400)
        .json({ message: 'name, email, phone & role are required' });
    }

    await staff.update({
      name,
      email,
      phone,
      role,
      shiftStart: shiftStart || null,
      shiftEnd:   shiftEnd   || null,
      wage:       wage       || null
    });

    return res.json(staff);
  } catch (err) {
    console.error('❌ updateStaff error:', err);
    return res.status(500).json({ message: 'Could not update staff', detail: err.message });
  }
}

/**
 * DELETE /api/staff/:id
 * Delete a staff member.
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
    return res.status(500).json({ message: 'Could not delete staff', detail: err.message });
  }
}
