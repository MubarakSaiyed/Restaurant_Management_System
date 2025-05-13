// server/controllers/orderController.js
import sequelize    from '../config/db.js';
import Order        from '../models/order.js';
import OrderItem    from '../models/orderItem.js';
import User         from '../models/User.js';
import Menu         from '../models/menu.js';

/**
 * GET /api/orders
 * (admin only)
 */
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User,      as: 'customer', attributes: ['id','name','email'] },
        {
          model: OrderItem,
          as:    'items',
          include: [{ model: Menu, attributes: ['id','name','price'] }]
        }
      ],
      order: [['createdAt','DESC']]
    });
    return res.json(orders);
  } catch (err) {
    console.error('❌ getAllOrders error:', err);
    return res.status(500).json({ message: 'Could not fetch orders' });
  }
}

/**
 * GET /api/orders/my
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
          include: [{ model: Menu, attributes: ['id','name','price'] }]
        }
      ],
      order: [['createdAt','DESC']]
    });
    return res.json(orders);
  } catch (err) {
    console.error('❌ getMyOrders error:', err);
    return res.status(500).json({ message: 'Could not fetch your orders' });
  }
}

/**
 * POST /api/orders
 */
export async function createOrder(req, res) {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Must provide an items array' });
  }

  const t = await sequelize.transaction();
  try {
    // 1) create base order
    const order = await Order.create(
      { userId: req.user.id, status: 'new' },
      { transaction: t }
    );

    // 2) bulk‐insert line‐items
    const toCreate = items.map(({ menuId, quantity }) => ({
      orderId:  order.id,
      menuId,
      quantity
    }));
    await OrderItem.bulkCreate(toCreate, { transaction: t });

    // 3) commit & reload
    await t.commit();
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id','name','email'] },
        {
          model: OrderItem,
          as:    'items',
          include: [{ model: Menu, attributes: ['id','name','price'] }]
        }
      ]
    });

    return res.status(201).json(fullOrder);
  } catch (err) {
    await t.rollback();
    console.error('❌ createOrder error:', err);
    return res.status(500).json({ message: 'Could not create order' });
  }
}

/**
 * PUT /api/orders/:id
 */
export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const valid     = ['new','in_progress','ready','served'];
  if (!valid.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    await order.save();

    // return updated with associations
    const updated = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id','name','email'] },
        {
          model: OrderItem,
          as:    'items',
          include: [{ model: Menu, attributes: ['id','name','price'] }]
        }
      ]
    });
    return res.json(updated);
  } catch (err) {
    console.error('❌ updateOrderStatus error:', err);
    return res.status(500).json({ message: 'Could not update order status' });
  }
}
