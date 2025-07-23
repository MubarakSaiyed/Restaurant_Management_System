import User   from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';


export const createUser = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password & role are required' });
    }
    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, role });
      // only return id/name/role, never the password
      return res.status(201).json({
        id:   user.id,
        name: user.name,
        role: user.role
      });
    } catch (err) {
      console.error('❌ createUser error:', err);
      const msg = err.errors
        ? err.errors.map(e => e.message).join('; ')
        : err.message;
      return res.status(400).json({ error: msg });
    }
  }
];
/**
 * GET /api/users[?role=staff]
 * — list users, optionally filtered by ?role=
 */
export const listUsers = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      // Allow optional ?role=staff (or whatever role)
      const roleFilter = req.query.role;
      const where = {};
      if (roleFilter) {
        where.role = roleFilter;
      }

      const users = await User.findAll({
        where,
        attributes: ['id','name', 'role'],
        order:      [['name','ASC']]
      });

      // return just id & name
      res.json(
        users.map(u => ({ id: u.id, name: u.name }))
      );
    } catch (err) {
      console.error('❌ listUsers error:', err);
      res.status(500).json({ error: 'Could not fetch users' });
    }
  }
];

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed, role: 'admin' });
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    const errors = err.errors ? err.errors.map(e => e.message) : [err.message];
    res.status(400).json({ message: 'Validation failed', errors });
  }
};

export const login = async (req, res) => {
  console.log('🔍 [login] req.body =', req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
