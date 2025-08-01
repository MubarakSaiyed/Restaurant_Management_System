import jwt from 'jsonwebtoken';

 //Protect routes by verifying a Bearer JWT.

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ message: 'Invalid authorization format' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload.userId, payload.role
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Allow only staff or admin users.
 */
export function requireStaff(req, res, next) {
  const role = req.user.role;
  if (role === 'staff' || role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Staff access only' });
}

/**
 * Allow only admin users.
 */
export function requireAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admins only' });
}
