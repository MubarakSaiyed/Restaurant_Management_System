// client/js/reservation.js
import { validateForm } from './validator.js';

const form = document.getElementById("reservationForm");
if (!form) console.error('❌ reservationForm not found in DOM!');

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // validate
  const errors = validateForm(form);
  if (Object.keys(errors).length) return;

  const data = {
    name:      form.name.value.trim(),
    email:     form.email.value.trim(),
    phone:     form.phone.value.trim(),
    date:      form.date.value,
    time:      form.time.value,
    partySize: parseInt(form.partySize.value, 10)
  };

  try {
    const res = await fetch("http://localhost:5000/api/reservations", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data)
    });

    if (res.ok) {
      alert("Reservation successful!");
      form.reset();
    } else {
      alert("Reservation failed.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error sending reservation.");
  }
});
