import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const Customer = sequelize.define('Customer', {
  code: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'customers',
  timestamps: true
});

export default Customer;
