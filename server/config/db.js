// server/config/db.js

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
// Load environment variables from the project root .env
dotenv.config({
    path: path.resolve(__dirname, '../.env')
  })
console.log('ENV DB_USER:', process.env.DB_USER);
console.log('ENV DB_PASSWORD:', process.env.DB_PASSWORD ? '*****' : null);

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

// Default export for convenience
export default sequelize;
