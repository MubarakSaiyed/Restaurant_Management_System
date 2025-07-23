// server/models/order.js

import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const Order = sequelize.define(
  'Order',
  {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true
    },
    userId: {
      type:      DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'new',
        'processing',
        'paid',
        'preparing',
        'in_progress',
        'ready',
        'on_the_way',
        'served',
        'cancelled'
      ),
      allowNull:    false,
      defaultValue: 'new'
    }
  },
  {
    tableName:  'orders',
    timestamps: true
  }
);

export default Order;
