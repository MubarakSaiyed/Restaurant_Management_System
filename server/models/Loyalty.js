// server/models/Loyalty.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Loyalty = sequelize.define('Loyalty', {
  guestCode: {
    type: DataTypes.STRING(8),
    primaryKey: true,
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'loyalties',
  timestamps: true
});

export default Loyalty;
