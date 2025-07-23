// server/models/Menu.js

import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const Menu = sequelize.define(
  'Menu',
  {
    id: {
      type:           DataTypes.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    name: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    category: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    price: {
      type:      DataTypes.FLOAT,
      allowNull: false
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true
    },
    available: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true
    },
    imageUrl: {
      type:      DataTypes.STRING,
      allowNull: true
    },
    stock: {
      type:         DataTypes.INTEGER,
      allowNull:    false,
      defaultValue: 0
    }
  },
  {
    tableName:  'menus',
    timestamps: true
  }
);

export default Menu;
