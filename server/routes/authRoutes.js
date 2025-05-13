// server/routes/authRoutes.js
import express from 'express';
import { login, registerAdmin } from '../controllers/userController.js';
import { requireAuth }          from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/auth/check
// — only valid JWTs will reach here; we return its decoded payload
router.get(
  '/check',
  requireAuth,
  (req, res) => {
    res.json({
      message: '✅ Auth route working!',
      user: req.user
    });
  }
);

// POST /api/auth/register
// — only an already‐logged‐in admin may create another admin
router.post(
  '/register',
  requireAuth,
  registerAdmin
);

// POST /api/auth/login
// — public: issues a new JWT
router.post(
  '/login',
  login
);

export default router;
