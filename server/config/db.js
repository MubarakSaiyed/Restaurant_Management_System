// server/config/db.js

import { Sequelize }      from 'sequelize';
import dotenv             from 'dotenv';
import path               from 'path';
import { fileURLToPath }  from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load env from project root (../../.env)
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

// Debug logs to confirm we loaded the right vars
console.log('ENV DB_NAME:   ', process.env.DB_NAME);
console.log('ENV DB_USER:   ', process.env.DB_USER);
console.log('ENV DB_PASSWORD:', process.env.DB_PASSWORD ? '••••••••' : null);
console.log('ENV DB_HOST:   ', process.env.DB_HOST);

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:     process.env.DB_HOST,
    dialect:  'mysql',
    logging:  false
  }
);

export default sequelize;
