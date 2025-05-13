import { DataTypes } from "sequelize";
import sequelize      from '../config/db.js';

const Reservation = sequelize.define("Reservation", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  partySize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Reservation;
