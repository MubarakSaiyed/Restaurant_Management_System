// server/middleware/requireAuth.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log('AUTH HEADER:', JSON.stringify(authHeader));

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // split off the first word as the scheme, everything else is the token
  const [scheme, ...rest] = authHeader.trim().split(/\s+/);
  const token = rest.join(' ');

  // check scheme case‐insensitively and that we have some token text
  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ message: 'Invalid authorization format' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
