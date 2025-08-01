import Menu from '../models/menu.js';

/**
 * GET /api/menu
 */
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

/**
 * POST /api/menu
 */
export const addMenu = async (req, res) => {
  const { name, category, price, description, available } = req.body;
  try {
    // Build payload
    const menuData = {
      name,
      category,
      price:       parseFloat(price),
      description: description || null,
      available:   available === 'on' || available === 'true'
    };

    // If an image was uploaded, save its URL
    if (req.file) {
      menuData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const menu = await Menu.create(menuData);
    res.status(201).json(menu);
  } catch (error) {
    console.error('addMenu error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/menu/:id
 */
export const updateMenu = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, available } = req.body;

  try {
    // Build update payload
    const updateData = {
      name,
      category,
      price:       parseFloat(price),
      description: description || null,
      available:   available === 'on' || available === 'true'
    };

    // If a new image was uploaded, overwrite imageUrl
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Perform update
    const [updatedCount] = await Menu.update(updateData, { where: { id } });
    if (!updatedCount) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    // Return the updated record
    const updatedMenu = await Menu.findByPk(id);
    res.json(updatedMenu);
  } catch (error) {
    console.error('updateMenu error:', error);
    res.status(500).json({ message: error.message });
  }
};


// DELETE /api/menu/:id
 
export const deleteMenu = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCount = await Menu.destroy({ where: { id } });
    if (!deletedCount) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json({ message: 'Dish removed' });
  } catch (error) {
    console.error('deleteMenu error:', error);
    res.status(500).json({ message: error.message });
  }
};
