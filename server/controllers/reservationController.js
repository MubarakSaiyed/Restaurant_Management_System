// server/controllers/reservationController.js

import Reservation              from '../models/Reservation.js';
import { loadTablesWithStatus } from './seatingController.js';

/**
 * GET /api/reservations
 */
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll();
    return res.json(reservations);
  } catch (err) {
    console.error('❌ getReservations error:', err);
    return res.status(500).json({ error: 'Could not fetch reservations' });
  }
};

/**
 * POST /api/reservations
 */
export const addReservation = async (req, res, next) => {
  const { name, email, phone, date, time, partySize, tableId } = req.body;

  // 1️⃣ must have every field
  if (!name || !email || !phone || !date || !time || !partySize || !tableId) {
    return res.status(400).json({
      error: 'All fields (name, email, phone, date, time, partySize, tableId) are required'
    });
  }
  // 2️⃣ validate date/time formats
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  }
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return res.status(400).json({ error: 'Time must be HH:MM (24-hour)' });
  }

  try {
    // 3️⃣ create with TableId
    const reservation = await Reservation.create({
      name,
      email,
      phone,
      date,
      time,
      partySize,
      userId:  req.user?.id || null,
      TableId: tableId
    });

    // 4️⃣ respond
    res.status(201).json(reservation);

    // 5️⃣ broadcast updated seating
    const io = req.app.get('io');
    if (io) {
      const payload = await loadTablesWithStatus();
      io.emit('seating:update', payload);
    }
  } catch (err) {
    console.error('❌ addReservation error:', err);
    if (
      err.name === 'SequelizeValidationError' ||
      err.name === 'SequelizeDatabaseError'
    ) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Could not create reservation' });
  }
};

/**
 * PUT /api/reservations/:id
 */
export const updateReservation = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, date, time, partySize, tableId } = req.body;

  // 1️⃣ require all fields again
  if (!name || !email || !phone || !date || !time || !partySize || !tableId) {
    return res.status(400).json({ error: 'All fields (including tableId) are required' });
  }

  try {
    // 2️⃣ update including TableId
    const [updatedCount] = await Reservation.update(
      { name, email, phone, date, time, partySize, TableId: tableId },
      { where: { id } }
    );
    if (!updatedCount) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    const updated = await Reservation.findByPk(id);

    // 3️⃣ respond
    res.json({
      message: 'Reservation updated successfully',
      reservation: updated
    });

    // 4️⃣ broadcast updated seating
    const io = req.app.get('io');
    if (io) {
      const payload = await loadTablesWithStatus();
      io.emit('seating:update', payload);
    }
  } catch (err) {
    console.error('❌ updateReservation error:', err);
    return res.status(500).json({ error: 'Could not update reservation' });
  }
};

/**
 * DELETE /api/reservations/:id
 */
export const deleteReservation = async (req, res, next) => {
  const { id } = req.params;
  try {
    // 1️⃣ delete
    const deletedCount = await Reservation.destroy({ where: { id } });
    if (!deletedCount) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // 2️⃣ respond
    res.json({ message: 'Reservation deleted successfully' });

    // 3️⃣ broadcast updated seating
    const io = req.app.get('io');
    if (io) {
      const payload = await loadTablesWithStatus();
      io.emit('seating:update', payload);
    }
  } catch (err) {
    console.error('❌ deleteReservation error:', err);
    return res.status(500).json({ error: 'Could not delete reservation' });
  }
};
