// server/controllers/orderController.js
import { sequelize, Order, OrderItem, User, Menu } from '../models/index.js';

const VALID_STATUSES = [
  'new',
  'processing',     // ← added
  'paid',           // ← added
  'preparing',
  'in_progress',
  'ready',
  'on_the_way',
  'served',
  'cancelled'
];

/**
 * GET /api/orders      — Admin & staff only
 */
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User,      as: 'customer', attributes: ['id','name','email'] },
        {
          model: OrderItem,
          as:    'items',
          include: [{ model: Menu, as: 'Menu', attributes: ['id','name','price'] }]
        }
      ],
      order: [['id','DESC']]
    });
    return res.json(orders);
  } catch (err) {
    console.error('❌ getAllOrders error:', err);
    return res.status(500).json({ message: 'Could not fetch orders' });
  }
}

/**
 * GET /api/orders/my   — Customer’s own orders
 */
export async function getMyOrders(req, res) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: User,      as: 'customer', attributes: ['id','name','email'] },
        {
          model: OrderItem,
          as:    'items',
          include: [{ model: Menu, as: 'Menu', attributes: ['id','name','price'] }]
        }
      ],
      order: [['id','DESC']]
    });
    return res.json(orders);
  } catch (err) {
    console.error('❌ getMyOrders error:', err);
    return res.status(500).json({ message: 'Could not fetch your orders' });
  }
}

/**
 * POST /api/orders     — Place new order (checks & decrements stock)
 */
export async function createOrder(req, res) {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Must provide a non-empty items array' });
  }

  const t = await sequelize.transaction();
  try {
    // 1) Load & lock referenced menu items
    const menuIds = items.map(i => i.menuId);
    const menus   = await Menu.findAll({
      where:       { id: menuIds },
      transaction: t,
      lock:        t.LOCK.UPDATE,
    });

    // 2) Validate stock & decrement
    for (const { menuId, quantity } of items) {
      const menu = menus.find(m => m.id === menuId);
      if (!menu) throw new Error(`Menu item ${menuId} not found`);
      if (quantity > menu.stock) {
        return res
          .status(400)
          .json({ message: `Only ${menu.stock} "${menu.name}" left in stock` });
      }
      menu.stock -= quantity;
      await menu.save({ transaction: t });
    }

    // 3) Create the order
    const order = await Order.create(
      { userId: req.user.id, status: 'new' },
      { transaction: t }
    );

    // 4) Bulk‐create items
    const toCreate = items.map(({ menuId, quantity }) => ({
      orderId: order.id,
      menuId,
      quantity
    }));
    await OrderItem.bulkCreate(toCreate, { transaction: t });

    // 5) Reload full order
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: User,      as: 'customer', attributes: ['id','name','email'] },
        {
          model: OrderItem,
          as:    'items',
          include: [{ model: Menu, as: 'Menu', attributes: ['id','name','price'] }]
        }
      ],
      transaction: t
    });

    await t.commit();
    return res.status(201).json(fullOrder);

  } catch (err) {
    await t.rollback();
    console.error('❌ createOrder error:', err);
    const status = err.message.startsWith('Only') ? 400 : 500;
    return res.status(status).json({ message: err.message });
  }
}

/**
 * PUT /api/orders/:id  — Update order status (admin/staff only)
 */
export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    await order.save();

    const updated = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id','name','email'] },
        {
          model: OrderItem,
          as:    'items',
          include: [{ model: Menu, as: 'Menu', attributes: ['id','name','price'] }]
        }
      ]
    });
    return res.json(updated);

  } catch (err) {
    console.error('❌ updateOrderStatus error:', err);
    return res.status(500).json({ message: 'Could not update order status' });
  }
}

/**
 * DELETE /api/orders/:id — Cancel an order
 */
export async function cancelOrder(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // only admins/staff or the owning customer may cancel
    const isStaff = req.user.role === 'admin' || req.user.role === 'staff';
    if (!isStaff && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // only new orders can be cancelled
    if (order.status !== 'new') {
      return res
        .status(400)
        .json({ message: 'Only new orders can be cancelled' });
    }

    await order.destroy();
    return res.json({ message: `Order #${order.id} cancelled` });

  } catch (err) {
    console.error('❌ cancelOrder error:', err);
    return res.status(500).json({ message: 'Could not cancel order' });
  }
}
