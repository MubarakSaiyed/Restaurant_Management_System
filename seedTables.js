// seedTables.js

import path              from 'path';
import dotenv            from 'dotenv';
import { sequelize }     from './server/config/db.js';
import Table             from './server/models/Table.js';

// 0) Load your .env so Sequelize can connect
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seed() {
  try {
    // 1) Authenticate
    await sequelize.authenticate();
    console.log('✅ DB connected for seeding');

    // 2) Find existing table names
    const existing = await Table.findAll({
      attributes: ['name'],
      raw:        true
    });
    const existingNames = new Set(existing.map(r => r.name));

    // 3) Build up to 15 rows, but skip any that already exist
    const capacities = [4, 2, 6,];
    const rowsToInsert = [];

    for (let i = 1; i <= 15; i++) {
      const name = String(i);
      if (existingNames.has(name)) continue;

      const idx = i - 1;
      rowsToInsert.push({
        name,
        capacity: capacities[idx % capacities.length],
        x:        50  + (idx % 5) * 100,
        y:        50  + Math.floor(idx / 5) * 100,
        status:   'available'
      });
    }

    // 4) Bulk‐create missing rows
    if (rowsToInsert.length) {
      await Table.bulkCreate(rowsToInsert);
      console.log(`✅ Seeded ${rowsToInsert.length} new tables.`);
    } else {
      console.log('🗄️  All 15 tables already exist—no action taken.');
    }

    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
