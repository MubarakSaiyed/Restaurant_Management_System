// server/controllers/menuController.js
import Menu from '../models/menu.js';

// ─── GET /api/menu ───────────────────────────────────────────────────────────
export const getMenus = async (req, res) => {
  try {
    console.log('GET /api/menu');
    const menus = await Menu.findAll();
    res.json(menus);
  } catch (error) {
    console.error('getMenus error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── POST /api/menu ──────────────────────────────────────────────────────────
export const addMenu = async (req, res) => {
  const { name, category, price, description, available } = req.body;
  try {
    const menu = await Menu.create({ name, category, price, description, available });
    res.status(201).json(menu);
  } catch (error) {
    console.error('addMenu error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── PUT /api/menu/:id ───────────────────────────────────────────────────────
export const updateMenu = async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await Menu.update(req.body, { where: { id } });
    if (!updated) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    const updatedDish = await Menu.findByPk(id);
    res.json(updatedDish);
  } catch (error) {
    console.error('updateMenu error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE /api/menu/:id ────────────────────────────────────────────────────
export const deleteMenu = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Menu.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json({ message: 'Dish removed' });
  } catch (error) {
    console.error('deleteMenu error:', error);
    res.status(500).json({ message: error.message });
  }
};
