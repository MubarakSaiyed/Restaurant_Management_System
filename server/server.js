import path               from 'path';
import { fileURLToPath }  from 'url';
import dotenv             from 'dotenv';

import express            from 'express';
import cors               from 'cors';
import http               from 'http';
import { Server as SocketIO } from 'socket.io';

// 0) __dirname & load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 1) Load Sequelize models & DB
import './models/index.js';            // User, Reservation, Table, etc.
import { sequelize }    from './config/db.js';

// 2) Import routes & middleware
import authRoutes        from './routes/authRoutes.js';
import menuRoutes        from './routes/menuRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import inventoryRoutes   from './routes/inventoryRoutes.js';
import staffRoutes       from './routes/staffRoutes.js';
import orderRoutes       from './routes/orderRoutes.js';
import reportRoutes      from './routes/reportRoutes.js';
import billRoutes        from './routes/billRoutes.js';
import shiftRoutes       from './routes/shiftRoutes.js';
import userRoutes        from './routes/userRoutes.js';
import feedbackRoutes    from './routes/feedbackRoutes.js';
import loyaltyRoutes     from './routes/loyaltyRoutes.js';
import seatingRoutes     from './routes/seatingRoutes.js';
import paymentRoutes, { handleWebhook } from './routes/paymentRoutes.js';

import { requireAuth, requireStaff } from './middleware/requireAuth.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// 3) Create HTTP server + Socket.IO
const httpServer = http.createServer(app);
const io         = new SocketIO(httpServer, { cors: { origin: '*' } });

// make `io` available to controllers via req.app.get('io')
app.set('io', io);

io.on('connection', socket => {
  console.log('📡 Socket connected:', socket.id);
});

// A) Stripe webhook (raw body)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// B) Serve client
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// C) Global middleware
app.use(cors());
app.use(express.json());

// D) Public API
app.use('/api/auth',         authRoutes);
app.use('/api/menu',         menuRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory',    inventoryRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/bills',        billRoutes);
app.use('/api/shifts',       shiftRoutes);
app.use('/api/users',        userRoutes);

// Serve client/images as “/images/…”
app.use(
  '/images',
  express.static(path.join(__dirname, '../client/images'))
);

// real‐time seating map (staff only)
app.use('/api/seating',  seatingRoutes);

// E) Feedback & Loyalty (no JWT required)
app.use('/api', feedbackRoutes);
app.use('/api', loyaltyRoutes);

// F) Protected API
app.use('/api/staff',  requireAuth, staffRoutes);
app.use('/api/orders', requireAuth, orderRoutes);

// G) Healthcheck & 404
app.get('/api', (_req, res) =>
  res.json({ message: '🍽️ API & Static files are running!' })
);
app.use((_, res) => res.status(404).json({ error: 'Not found' }));

// H) Boot DB & start HTTP+WebSocket server
;(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced');

    httpServer.listen(PORT, () => {
      console.log(`🚀 Listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
})();
