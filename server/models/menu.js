// server/models/menu.js
import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const Menu = sequelize.define('Menu', {
  name:        { type: DataTypes.STRING, allowNull: false },
  category:    { type: DataTypes.STRING, allowNull: false },
  price:       { type: DataTypes.FLOAT,  allowNull: false },
  description: { type: DataTypes.TEXT },
  available:   { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName:  'menus',
  timestamps: true
});

export default Menu;
