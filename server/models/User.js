// server/models/User.js
import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';



const User = sequelize.define('User', {
  name: {
    type:      DataTypes.STRING,
    allowNull: false,
    validate:  { notEmpty: { msg: "Name is required" } }
  },
  email: {
    type:      DataTypes.STRING,
    allowNull: false,
    unique:    'unique_users_email',
    validate:  {
      isEmail:  { msg: "Must be a valid email address" },
      notEmpty: { msg: "Email is required" }
    }
  },  
  password: {
    type:      DataTypes.STRING,
    allowNull: false,
    validate:  {
      notEmpty: { msg: "Password is required" },
      len:      { args: [6, 100], msg: "Password must be at least 6 characters" }
    }
  },
  role: {
    type:         DataTypes.ENUM('admin','staff','customer'),
    allowNull:    false,
    defaultValue: 'customer',
    validate:     { isIn: { args: [['admin','staff','customer']], msg: "Invalid role" } }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type:         DataTypes.DATE,
    allowNull:    false,
    defaultValue: DataTypes.NOW
  },
  // server/models/user.js (excerpt)
  wageRate: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    defaultValue: 0.0  // NPR per hour
  },
loyaltyPoints: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0
  }, 
}, {
  tableName:  'users',
  timestamps: true
});



export default User;