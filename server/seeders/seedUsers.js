// server/seeders/seedUsers.js

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';  // make sure this path is correct

// Load environment variables (so that models/db.js will see them too)
dotenv.config();

async function seed() {
  // Ensure the users table exists without dropping existing data
  await User.sync({ force: false });

  const email = 'customer@gmail.com';
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log('↩️  Customer already exists');
    process.exit(0);
  }

  const hash = await bcrypt.hash('123456', 10);
  await User.create({
    name:     'Demo Customer',
    email,
    password: hash,
    role:     'customer'
  });

  console.log('✅  Seeded customer user:', email, '/ 123456');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
