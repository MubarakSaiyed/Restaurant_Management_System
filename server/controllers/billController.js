// server/controllers/billController.js
import { sequelize } from '../config/db.js';
import { Order, OrderItem, Menu } from '../models/index.js';
import Bill from '../models/bill.js';

/**
 * POST /api/bills/:orderId/split
 * Body: { shares: [ { name, items: [ { menuItemId, quantity } ] } ] }
 */
export async function splitBill(req, res) {
  const { orderId } = req.params;
  const { shares }  = req.body;

  // 1) Verify order belongs to user
  const order = await Order.findByPk(orderId);
  if (!order || order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not your order' });
  }

  // 2) Load OrderItems + their Menu.price
  const orderItems = await OrderItem.findAll({
    where: { orderId },
    include: [{ model: Menu, as: 'Menu', attributes: ['price'] }]
  });

  // 3) Transactionally create split bills
  const t = await sequelize.transaction();
  try {
    // a) remove any existing shares
    await Bill.destroy({ where: { orderId }, transaction: t });

    // b) for each share block
    for (const share of shares) {
      let totalPaisa = 0;
      for (const si of share.items) {
        const menuId = si.menuItemId ?? si.menuId;
        const oi = orderItems.find(o => o.menuId === menuId);
        const qty = parseFloat(si.quantity);

        if (!oi || qty < 0 || qty - oi.quantity > 1e-6) {
          throw new Error(`Invalid share qty for item ${menuId}`);
        }

        // price in paisa, then multiply by quantity and round
        const pricePaisa = Math.round(oi.Menu.price * 100);
        totalPaisa += Math.round(pricePaisa * qty);
      }

      // create the Bill row
      await Bill.create({
        orderId,
        name:   share.name,
        amount: totalPaisa
      }, { transaction: t });
    }

    // commit & return
    await t.commit();
    const bills = await Bill.findAll({ where: { orderId } });
    return res.json(bills);

  } catch (err) {
    await t.rollback();
    console.error('❌ splitBill error', err);
    return res.status(400).json({ error: err.message });
  }
}

/**
 * GET /api/bills/:orderId
 */
export async function getBill(req, res) {
  const bills = await Bill.findAll({ where: { orderId: req.params.orderId } });
  res.json(bills);
}

/**
 * POST /api/bills/:billId/pay
 */
export async function payBillShare(req, res) {
  const bill = await Bill.findByPk(req.params.billId);
  if (!bill) {
    return res.status(404).json({ error: 'Share not found' });
  }
  bill.paid = true;
  await bill.save();
  res.json(bill);
}
