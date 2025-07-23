// server/controllers/inventoryController.js

import Menu from '../models/menu.js';

/**
 * GET /api/inventory
 * (staff & admin only)
 */
export const listInventory = async (req, res) => {
  try {
    const items = await Menu.findAll({
      attributes: ['id','name','category','price','stock','available']
    });
    res.json(items);
  } catch (err) {
    console.error('❌ listInventory error:', err);
    res.status(500).json({ message: 'Could not fetch inventory' });
  }
};

/**
 * PUT /api/inventory/:id
 * (staff & admin only)
 */
export const updateInventory = async (req, res) => {
  const { id }    = req.params;
  let { stock }   = req.body;

  // basic validation
  stock = parseInt(stock, 10);
  if (isNaN(stock) || stock < 0) {
    return res.status(400).json({ message: 'Invalid stock value' });
  }

  try {
    const item = await Menu.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    item.stock = stock;
    await item.save();

    res.json(item);

  } catch (err) {
    console.error('❌ updateInventory error:', err);
    res.status(500).json({ message: 'Could not update stock' });
  }
};
