// server/models/orderItem.js

import { DataTypes } from 'sequelize';
import sequelize      from '../config/db.js';

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true
    },

    // Must match order_items.orderId
    orderId: {
      type:      DataTypes.INTEGER,
      allowNull: false
    },

    // Must match order_items.menuId
    menuId: {
      type:      DataTypes.INTEGER,
      allowNull: false
    },

    quantity: {
      type:         DataTypes.INTEGER,
      allowNull:    false,
      defaultValue: 1
    }
  },
  {
    tableName:  'order_items',
    timestamps: true     // ← no createdAt / updatedAt
  }
);

export default OrderItem;
