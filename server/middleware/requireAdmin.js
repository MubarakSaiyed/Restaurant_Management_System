// server/middleware/requireAdmin.js
export function requireAdmin(req, res, next) {
    // by now requireAuth has already set req.user = { id, role, ... }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
  }
  