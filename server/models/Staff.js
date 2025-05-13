// server/models/Staff.js
import { DataTypes } from 'sequelize';
import sequelize      from '../config/db.js';

const Staff = sequelize.define('Staff', {
  name: {
    type:      DataTypes.STRING,
    allowNull: false
  },
  role: {
    type:      DataTypes.STRING,
    allowNull: false
  },
  shiftStart: {
    type:      DataTypes.TIME,
    allowNull: false
  },
  shiftEnd: {
    type:      DataTypes.TIME,
    allowNull: false
  },
  wage: {
    type:      DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName:  'staff',
  timestamps: true
});

export default Staff;
