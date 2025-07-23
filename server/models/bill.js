import { DataTypes } from 'sequelize';
import sequelize       from '../config/db.js';

const Bill = sequelize.define('Bill', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true
  },
  orderId: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type:      DataTypes.STRING,  // e.g. “Alice’s share”
    allowNull: false
  },
  amount: {
    type:      DataTypes.INTEGER, // paisa
    allowNull: false
  },
  paid: {
    type:      DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'bills',
  timestamps: true
});

export default Bill;
