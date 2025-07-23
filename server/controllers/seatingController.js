// server/controllers/seatingController.js

import Table       from '../models/Table.js';
import Reservation from '../models/Reservation.js';

/**
 * Helper: load all tables and annotate status based on today's reservations.
 */
export async function loadTablesWithStatus() {
  // 1️⃣ fetch all tables
  const tables = await Table.findAll({
    attributes: ['id','name','capacity','x','y','status'],
    order:      [['name','ASC']],
    raw:        true
  });

  // 2️⃣ today's date
  const today = new Date().toISOString().slice(0, 10);

  // 3️⃣ today's reservations
  const reservations = await Reservation.findAll({
    where:      { date: today },
    attributes: ['id','TableId','userId','date','time','partySize'],
    raw:        true
  });

  // 4️⃣ map by table
  const byTable = reservations.reduce((acc, r) => {
    acc[r.TableId] = r;
    return acc;
  }, {});

  // 5️⃣ build payload
  return tables.map(t => {
    const resv = byTable[t.id];
    return {
      id:       t.id,
      number:   t.name,
      capacity: t.capacity,
      x:        t.x,
      y:        t.y,
      status:   resv ? 'reserved' : t.status,
      reservation: resv
        ? {
            id:        resv.id,
            userId:    resv.userId,
            date:      resv.date,
            time:      resv.time,
            partySize: resv.partySize
          }
        : null
    };
  });
}

/**
 * GET /api/seating
 * Public: returns the current seating payload.
 */
export async function getSeatingChart(req, res, next) {
  try {
    const payload = await loadTablesWithStatus();
    return res.json(payload);
  } catch (err) {
    console.error('❌ getSeatingChart error:', err);
    next(err);
  }
}
