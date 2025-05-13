// server/models/index.js
// side‐effect import — define all models first
import '../config/db.js';      // ensures sequelize is initialized
import User      from './User.js';
import Menu      from './menu.js';
import Staff     from './Staff.js';
import Reservation from './Reservation.js';
import Order     from './order.js';
import OrderItem from './orderItem.js';
import { sequelize } from '../config/db.js';
  
// ————————— Associations —————————

// User ↔ Reservations
User.hasMany(Reservation,   { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// User ↔ Orders
User.hasMany(Order,   { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// Order ↔ OrderItems
Order.hasMany(OrderItem,    { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order,  { foreignKey: 'orderId' });

// Menu ↔ OrderItems
Menu.hasMany(OrderItem,     { foreignKey: 'menuId',  as: 'orderItems' });
OrderItem.belongsTo(Menu,   { foreignKey: 'menuId' });

// (Staff has no order‐related associations right now)

// no need to export anything — this file is just for side‐effects
