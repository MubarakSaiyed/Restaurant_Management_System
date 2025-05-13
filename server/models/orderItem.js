// server/models/orderItem.js
import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const OrderItem = sequelize.define('OrderItem', {
  orderId: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },
  menuId: {
    type:      DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type:         DataTypes.INTEGER,
    allowNull:    false,
    defaultValue: 1
  }
}, {
  tableName:  'order_items',
  timestamps: false
});

export default OrderItem;
