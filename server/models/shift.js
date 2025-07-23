// server/models/shift.js
import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';
import User          from './User.js';   
import Staff         from './Staff.js'; 

const Shift = sequelize.define('Shift', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  userId: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type:      DataTypes.DATEONLY,  // e.g. '2025-07-18'
    allowNull: false,
  },
  startTime: {
    type:      DataTypes.TIME,      // e.g. '09:00'
    allowNull: false,
  },
  endTime: {
    type:      DataTypes.TIME,      // e.g. '17:00'
    allowNull: false,
  }
}, {
  tableName:  'shifts',
  timestamps: true
});

// ── Wire up associations ──────────────────────────────────────────────
Shift.belongsTo(User, {
  foreignKey: 'userId',
  as:         'user'
});
Shift.belongsTo(Staff, { 
    foreignKey:'userId', 
    as:'staff' });

User.hasMany(Shift, {
  foreignKey: 'userId',
  as:         'shifts'
});

export default Shift;
