// server/seeders/seedUsers.js

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function seed() {
  await User.sync({ force: false });

  const users = [
    {
      name:     'Admin User',
      email:    'admin@gmail.com',
      password: 'admin123',
      role:     'admin'
    },
    {
      name:     'Demo Customer',
      email:    'customer@gmail.com',
      password: '123456',
      role:     'customer'
    }
  ];

  for (const u of users) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (existing) {
      console.log(`↩️  ${u.role} (${u.email}) already exists`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 10);
    await User.create({
      name:     u.name,
      email:    u.email,
      password: hash,
      role:     u.role
    });

    console.log(`✅  Seeded ${u.role}: ${u.email} / ${u.password}`);
  }

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
