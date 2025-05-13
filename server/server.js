// server/server.js
import express  from 'express';
import cors     from 'cors';
import dotenv   from 'dotenv';

// 1) side‐effect import to define models & associations
import './models/index.js';

// 2) bring in your Sequelize instance
import { sequelize }     from './config/db.js';

import authRoutes        from './routes/authRoutes.js';
import staffRoutes       from './routes/staffRoutes.js';
import menuRoutes        from './routes/menuRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import orderRoutes       from './routes/orderRoutes.js';
import { requireAuth }   from './middleware/requireAuth.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// public
app.use('/api/auth', authRoutes);

// protected
app.use('/api/staff',       requireAuth, staffRoutes);
app.use('/api/menu',        requireAuth, menuRoutes);
app.use('/api/reservations',requireAuth, reservationRoutes);
app.use('/api/orders',      orderRoutes); // orderRoutes does its own requireAuth/requireAdmin

// root health check
app.get('/', (req, res) =>
  res.send('🏠 Restaurant Management System API Running ✅')
);

// start everything
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    await sequelize.sync();
    console.log('✅ Tables synced');
    app.listen(PORT, () =>
      console.log(`🚀 Listening on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
})();
