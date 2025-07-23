// server/models/Table.js
import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const Table = sequelize.define('Table', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:    'unique_tables_name'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,       // default seats
  },
  x: {            // e.g. percentage or grid cell
    type: DataTypes.FLOAT,
    allowNull: false
  },
  y: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available','reserved','occupied'),
    allowNull: false,
    defaultValue: 'available',
  }
}, {
  tableName: 'tables',     
  timestamps: false        
});

export default Table;
