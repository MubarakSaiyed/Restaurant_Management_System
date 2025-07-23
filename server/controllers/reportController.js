// server/controllers/reportController.js
import { Op, fn, col, literal } from 'sequelize';
import { Order, OrderItem, Menu, User } from '../models/index.js';

/**
 * GET /api/reports/sales?days=7
 * Returns [{ date: 'YYYY-MM-DD', revenue: '1234.00' }, …]
 */
export async function getSalesOverTime(req, res) {
  const days = parseInt(req.query.days, 10) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const rows = await OrderItem.findAll({
      attributes: [
        [fn('DATE', col('order.createdAt')), 'date'],
        [fn('SUM', literal('`quantity` * `Menu`.`price`')), 'revenue']
      ],
      include: [
        {
          model: Order,
          as: 'order',            // must match your OrderItem.belongsTo alias
          attributes: [],
          where: {
            status:    { [Op.not]: 'new' },
            createdAt: { [Op.gte]: since }
          }
        },
        {
          model: Menu,
          as: 'Menu',             // matches your Menu association alias
          attributes: []
        }
      ],
      group: [literal('DATE(`order`.`createdAt`)')],
      order: [literal('DATE(`order`.`createdAt`)')]
    });

    return res.json(rows.map(r => r.get()));
  } catch (err) {
    console.error('❌ getSalesOverTime error', err);
    return res.status(500).json({ error: 'Could not fetch sales data' });
  }
}

/**
 * GET /api/reports/inventory-trends
 * Returns [{ name: 'Burger', sold: 123, stock: 45 }, …]
 */
export async function getInventoryTrends(req, res) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  try {
    // Top 10 sold in last 30d
    const sold = await OrderItem.findAll({
      attributes: [
        'menuId',
        [fn('SUM', col('quantity')), 'soldQty']
      ],
      include: [
        {
          model: Order,
          as: 'order',           // lowercase 'order'
          where: {
            status:    { [Op.not]: 'new' },
            createdAt: { [Op.gte]: since }
          },
          attributes: []
        }
      ],
      group: ['menuId'],
      order: [[literal('soldQty'), 'DESC']],
      limit: 10
    });

    const menuIds = sold.map(s => s.get('menuId'));
    const menus   = await Menu.findAll({ where: { id: menuIds } });

    const data = sold.map(s => {
      const menuId  = s.get('menuId');
      const soldQty = parseInt(s.get('soldQty'), 10);
      const menu    = menus.find(m => m.id === menuId);
      return {
        name:  menu.name,
        sold:  soldQty,
        stock: menu.stock
      };
    });

    return res.json(data);
  } catch (err) {
    console.error('❌ getInventoryTrends error', err);
    return res.status(500).json({ error: 'Could not fetch inventory trends' });
  }
}

/**
 * GET /api/reports/staff-kpis
 * Returns [{ name: 'Alice', count: 42 }, …]
 */
export async function getStaffKPIs(req, res) {
  try {
    const rows = await Order.findAll({
      attributes: [
        'userId',
        [fn('COUNT', col('id')), 'ordersProcessed']
      ],
      where: { status: { [Op.not]: 'new' } },
      group: ['userId']
    });

    const userIds = rows.map(r => r.get('userId'));
    const users   = await User.findAll({
      where:      { id: userIds },
      attributes: ['id','name']
    });

    const data = rows.map(r => {
      const uid  = r.get('userId');
      const user = users.find(u => u.id === uid);
      return {
        name:  user?.name || `#${uid}`,
        count: parseInt(r.get('ordersProcessed'), 10)
      };
    });

    return res.json(data);
  } catch (err) {
    console.error('❌ getStaffKPIs error', err);
    return res.status(500).json({ error: 'Could not fetch staff KPIs' });
  }
}
