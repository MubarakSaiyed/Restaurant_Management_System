import Reservation from "../models/Reservation.js";

export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addReservation = async (req, res) => {
  const { name, email, phone, date, time, partySize } = req.body;
  try {
    const reservation = await Reservation.create({ name, email, phone, date, time, partySize });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReservation = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, date, time, partySize } = req.body;
  try {
    await Reservation.update({ name, email, phone, date, time, partySize }, { where: { id } });
    res.json({ message: "Reservation updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  try {
    await Reservation.destroy({ where: { id } });
    res.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
