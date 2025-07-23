// server/controllers/paymentController.js
import dotenv from 'dotenv';
dotenv.config();

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import { sequelize }              from '../config/db.js';
import { Order, OrderItem, Menu } from '../models/index.js';

/**
 * POST /api/payments/create-payment-intent
 */
export async function createPaymentIntent(req, res) {
  const { items, currency = 'npr' } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Must include a non-empty items array' });
  }

  // Calculate total
  const menuIds = items.map(i => i.menuId);
  const menus   = await Menu.findAll({ where: { id: menuIds } });
  let amount = 0;
  for (let i of items) {
    const m = menus.find(x => x.id === i.menuId);
    if (!m) {
      return res.status(400).json({ error: `Unknown menuId ${i.menuId}` });
    }
    amount += Math.round(m.price * 100) * i.quantity;
  }

  const t = await sequelize.transaction();
  try {
    // create Order
    const order = await Order.create(
      { status: 'new', userId: req.user.id },
      { transaction: t }
    );
    // create OrderItems
    await OrderItem.bulkCreate(
      items.map(i => ({
        orderId:  order.id,
        menuId:   i.menuId,
        quantity: i.quantity
      })),
      { transaction: t }
    );
    // create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order.id.toString() }
    });

    await t.commit();
    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    await t.rollback();
    console.error('⚠️ createPaymentIntent error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/payments/webhook
 */
export async function handleWebhook(req, res) {
  const sig   = req.headers['stripe-signature'];
  let   event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Debug: log the entire event
  console.log('🔔 Stripe webhook received:', event.type);
  console.dir(event.data.object, { depth: 1 });

  if (event.type === 'payment_intent.succeeded') {
    const pi      = event.data.object;
    const orderId = pi.metadata.orderId;
    console.log(`✅ PaymentIntent succeeded for Order ${orderId}`);

    try {
      const [updatedCount] = await Order.update(
        { status: 'paid' },
        { where: { id: orderId } }
      );
      if (updatedCount === 1) {
        console.log(`   → Order ${orderId} status set to paid`);
      } else {
        console.warn(`   → No Order row updated for id ${orderId}`);
      }
    } catch (dbErr) {
      console.error(`❌ Failed to mark Order ${orderId} paid:`, dbErr);
    }
  }
  else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    console.warn(`❌ PaymentIntent failed: ${pi.last_payment_error?.message}`);
  }
  else {
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt
  res.json({ received: true });
}
