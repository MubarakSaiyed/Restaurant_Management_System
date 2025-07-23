// server/models/index.js

import '../config/db.js';
import { sequelize } from '../config/db.js';

import User from './User.js';
import Menu from './menu.js';
import Staff from './Staff.js';
import Reservation from './Reservation.js';
import Order from './order.js';
import OrderItem from './orderItem.js';
import Bill from './bill.js';
import Shift from './shift.js';
import Table from './Table.js';

// ————————— Associations —————————

User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Menu.hasMany(OrderItem, { foreignKey: 'menuId', as: 'orderItems' });
OrderItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'Menu' });

Order.hasMany(Bill,    { as: 'bills', foreignKey: 'orderId' });
Bill.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });



export {
  sequelize,
  User,
  Menu,
  Staff,
  Reservation,
  Order,
  OrderItem,
  Shift
};

(async () => {
  try {
    const cnt = await Table.count();
    console.log(`🍽️ You have ${cnt} seating tables defined`);
  } catch (err) {
    // ignore the “ER_NO_SUCH_TABLE” until the first sync
    if (err.name === 'SequelizeDatabaseError' && err.sqlState === '42S02') {
      console.warn('⚠️ seating table not ready yet; skipping count');
    } else {
      console.error('❌ unexpected error counting seating tables:', err);
    }
  }
})();

