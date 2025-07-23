import express from 'express';
import multer  from 'multer';
import path    from 'path';
import { fileURLToPath } from 'url';

import {
  getMenus,
  addMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menuController.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// PUBLIC: anyone can read the menu
router.get('/', getMenus);

// ADMIN ONLY: create a new menu item (with optional image)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  addMenu
);

// ADMIN ONLY: update a menu item (with optional new image)
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  updateMenu
);

// ADMIN ONLY: delete a menu item
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  deleteMenu
);

export default router;
