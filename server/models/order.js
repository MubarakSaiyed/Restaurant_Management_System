// server/models/order.js
import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const Order = sequelize.define('Order', {
  userId: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },
  total: {
    type:         DataTypes.FLOAT,
    allowNull:    false,
    defaultValue: 0
  },
  status: {
    type:         DataTypes.ENUM('new','in_progress','ready','served'),
    allowNull:    false,
    defaultValue: 'new'
  }
}, {
  tableName:  'orders',
  timestamps: true
});

export default Order;
