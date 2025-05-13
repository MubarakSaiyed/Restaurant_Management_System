// client/js/reservations.js
import { authedFetch }      from './api.js';
import { showNotification } from './notifier.js';
import { validateForm }     from './validator.js';

if (!localStorage.getItem('jwt')) {
  window.location.href = 'login.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('jwt');
  window.location.href = 'login.html';
});

async function loadReservations() {
  try {
    const reservations = await authedFetch('/reservations');

    const tbody = document
      .getElementById('reservationsTable')
      .querySelector('tbody');
    tbody.innerHTML = '';

    reservations.forEach(r => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${r.name}</td>
        <td>${r.email}</td>
        <td>${r.phone}</td>
        <td>${r.date}</td>
        <td>${r.time}</td>
        <td>${r.partySize}</td>
        <td>
          <button class="delete-btn" data-id="${r.id}">Delete</button>
        </td>
      `;
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Delete this reservation?')) return;
        try {
          await authedFetch(`/reservations/${id}`, { method: 'DELETE' });
          showNotification('Reservation deleted', 'success');
          await loadReservations();
        } catch (err) {
          console.error('Delete error:', err);
          showNotification('Failed to delete: ' + err.message, 'error');
        }
      });
    });

  } catch (err) {
    console.error('❌ loadReservations error:', err);
    showNotification('Could not load reservations: ' + err.message, 'error');
  }
}

const resForm = document.getElementById('resForm');
if (resForm) {
  resForm.addEventListener('submit', async e => {
    e.preventDefault();

    // validate
    const errors = validateForm(resForm);
    if (Object.keys(errors).length) return;

    const fd = new FormData(resForm);
    const payload = {
      name:      fd.get('name'),
      email:     fd.get('email'),
      phone:     fd.get('phone'),
      date:      fd.get('date'),
      time:      fd.get('time'),
      partySize: parseInt(fd.get('partySize'), 10),
    };

    try {
      await authedFetch('/reservations', {
        method: 'POST',
        body:   JSON.stringify(payload),
      });
      showNotification('Table booked', 'success');
      resForm.reset();
      await loadReservations();
    } catch (err) {
      console.error('Booking error:', err);
      showNotification('Could not book table: ' + err.message, 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', loadReservations);
