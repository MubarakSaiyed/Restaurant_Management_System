import { DataTypes } from 'sequelize';
import sequelize     from '../config/db.js';

const Reservation = sequelize.define(
  'Reservation',
  {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true
    },
    name: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    email: {
      type:      DataTypes.STRING,
      allowNull: false,
      validate:  { isEmail: true }
    },
    phone: {
      type:      DataTypes.STRING,
      allowNull: false
    },
    date: {
      type:      DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type:      DataTypes.TIME,
      allowNull: false
    },
    partySize: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      validate:  { min: 1 }
    },
    // tracks logged‐in user, if any
    userId: {
      type:      DataTypes.INTEGER,
      allowNull: true
    },

    // ← new foreign key for seating chart
    TableId: {
      type:       DataTypes.INTEGER,
      allowNull:   true,                // must be nullable for ON DELETE SET NULL
      references: { model: 'Tables', key: 'id' },
      onUpdate:   'CASCADE',
      onDelete:   'SET NULL'
    }
  },
  {
    tableName:  'reservations',  // matches your MySQL table
    timestamps: true
  }
);

// set up associations
Reservation.associate = models => {
  // each reservation belongs to a table
  Reservation.belongsTo(models.Table, {
    foreignKey: 'TableId',
    as:         'table'
  });

  // and optionally to a user
  Reservation.belongsTo(models.User, {
    foreignKey: 'userId',
    as:         'user'
  });
};

export default Reservation;
