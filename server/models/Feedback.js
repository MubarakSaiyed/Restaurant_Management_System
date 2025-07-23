// server/models/Feedback.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // our new guestCode field (8 chars)
  guestCode: {
    type: DataTypes.STRING(8),
    allowNull: false
  },

  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },

  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'feedbacks',
  timestamps: true
});

export default Feedback;
