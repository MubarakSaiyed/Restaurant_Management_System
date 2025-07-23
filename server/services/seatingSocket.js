// server/services/seatingSocket.js
import { Server }  from 'socket.io';
import Table       from '../models/Table.js';
import Reservation from '../models/Reservation.js';

/**
 * Initialize the seating socket.
 * @param {import('http').Server} httpServer
 */
export default function initSeatingSocket(httpServer) {
  const io = new Server(httpServer, {
    path: '/socket.io'
  });

  io.on('connection', socket => {
    socket.on('seating:load', async () => {
      const tables = await loadTablesWithStatus();
      socket.emit('seating:update', tables);
    });
  });

  return {
    io,
    broadcastUpdate: async () => {
      const tables = await loadTablesWithStatus();
      io.emit('seating:update', tables);
    }
  };
}

/** Helper: load all tables and annotate status based on today’s reservations */
async function loadTablesWithStatus() {
  // 1️⃣ fetch all tables
  const tables = await Table.findAll({ raw: true });

  // 2️⃣ compute today's date (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // 3️⃣ fetch all reservations for today
  //    (make sure your DB has a `TableId` column on reservations)
  const reserved = await Reservation.findAll({
    where: { date: today },
    raw: true
  });

  // 4️⃣ build a set of reserved table IDs
  const reservedIds = new Set(reserved.map(r => r.TableId));

  // 5️⃣ map tables → include reserved status + any reservation info
  return tables.map(t => {
    const isReserved = reservedIds.has(t.id);
    const resv     = isReserved && reserved.find(r => r.TableId === t.id);

    return {
      id:            t.id,
      x:             t.x,
      y:             t.y,
      capacity:      t.capacity,
      status:        isReserved ? 'reserved' : t.status,
      reservationEnd: isReserved ? resv.time : null
    };
  });
}
