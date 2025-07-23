// server/models/Staff.js
import { DataTypes } from 'sequelize';
import sequelize      from '../config/db.js';

const Staff = sequelize.define(
  'Staff',
  {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true
    },
    name: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    email: {
      type:      DataTypes.STRING,
      allowNull: false,
      validate:  { isEmail: true }
    },
    phone: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    role: {
      type:      DataTypes.ENUM('staff', 'admin'),
      allowNull: false
    },
    shiftStart: {
      type:      DataTypes.TIME,
      allowNull: true
    },
    shiftEnd: {
      type:      DataTypes.TIME,
      allowNull: true
    },
    wage: {
      type:      DataTypes.FLOAT,
      allowNull: true
    }
  },
  {
    tableName:  'staff',
    timestamps: false  // ← don't expect createdAt/updatedAt columns
  }
);

export default Staff;
