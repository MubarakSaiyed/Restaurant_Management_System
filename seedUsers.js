// seedUsers.js

import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import { sequelize } from './server/config/db.js';
import User from './server/models/User.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const usersToSeed = [
  {
    name: 'Customer',
    email: 'customer@gmail.com',
    password: '123456',
    role: 'customer',
  },
  {
    name: 'Staff',
    email: 'staff@gmail.com',
    password: 'staff123',
    role: 'staff',
  },
  {
    name: 'Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected for seeding');

    for (const userData of usersToSeed) {
      const hashed = await bcrypt.hash(userData.password, 10);

      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          name:     userData.name,
          password: hashed,
          role:     userData.role
        }
      });

      if (created) {
        console.log(`✅ Seeded ${userData.email} (${userData.role})`);
      } else {
        console.log(`🗄️  ${userData.email} already exists`);
      }
    }

    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
