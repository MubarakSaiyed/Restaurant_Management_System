// server/controllers/authController.js

import jwt    from 'jsonwebtoken';
import User   from '../models/User.js';
import bcrypt from 'bcrypt';

export async function login(req, res) {
  try {
    const email    = req.body?.email?.trim();
    const password = req.body?.password;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are both required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Include both userId and role in the token payload
    const payload = { userId: user.id, role: user.role };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Return both token and explicit role
    return res.json({
      token,
      role: user.role
    });

  } catch (err) {
    console.error('❌ authController.login error:', err);
    return res
      .status(500)
      .json({ message: 'Internal server error' });
  }
}
