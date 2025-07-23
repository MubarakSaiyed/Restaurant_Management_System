import express from 'express';
import {
  createUser,
  listUsers,
  registerAdmin,
  login
} from '../controllers/userController.js';

const router = express.Router();

// Register Admin (only first-time; thereafter blocked by requireAdmin)
router.post("/register", registerAdmin);

// Login
router.post("/login", login);

router.post('/', ...createUser);

// List users (with optional ?role=staff)
router.get("/", ...listUsers);

export default router;
