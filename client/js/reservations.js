// client/js/reservations.js

import { authedFetch, getUserRole } from './api.js';
import { showNotification }         from './notifier.js';

const loginLink           = document.getElementById('loginLink');
const logoutBtn           = document.getElementById('logoutBtn');
const allResLink          = document.getElementById('allResLink');
const reservationsSection = document.getElementById('reservationsSection');
const tbody               = document.querySelector('#reservationsTable tbody');

const role = getUserRole() || 'guest';

// ── NAV / AUTH TOGGLE ───────────────────────────────────
if (role === 'guest') {
  loginLink.classList.remove('hidden');
  logoutBtn.classList.add('hidden');
} else {
  loginLink.classList.add('hidden');
  logoutBtn.classList.remove('hidden');
}
logoutBtn.onclick = () => {
  localStorage.clear();
  window.location.href = 'menu.html';
};

// ── ROLE CHECK: only admin sees this page ──────────────
if (role !== 'admin') {
  allResLink?.classList.add('hidden');
  reservationsSection?.classList.add('hidden');
} else {
  document.addEventListener('DOMContentLoaded', loadReservations);
}

/**
 * Fetch & render all reservations (admin only)
 */
async function loadReservations() {
  // show loading row
  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center; padding:1rem;">
        Loading…
      </td>
    </tr>
  `;

  try {
    // 1) fetch raw response
    const res  = await authedFetch('/reservations', { method: 'GET' });
    // 2) parse JSON
    const list = await res.json();

    // 3) guard array
    if (!Array.isArray(list)) {
      throw new Error(list.message || 'Unexpected response');
    }

    // 4) render or empty state
    tbody.innerHTML = '';
    if (list.length === 0) {
      const tr = tbody.insertRow();
      const td = tr.insertCell();
      td.colSpan = 7;
      td.textContent = 'No reservations found.';
      return;
    }

    list.forEach(r => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${r.name}</td>
        <td>${r.email}</td>
        <td>${r.phone}</td>
        <td>${r.date}</td>
        <td>${r.time}</td>
        <td>${r.partySize}</td>
        <td>
          <button class="delete-btn" data-id="${r.id}">
            Delete
          </button>
        </td>
      `;
    });

    // 5) attach delete handlers
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Delete this reservation?')) return;
        try {
          await authedFetch(`/reservations/${btn.dataset.id}`, {
            method: 'DELETE'
          });
          showNotification('Reservation deleted','success');
          loadReservations();
        } catch (err) {
          console.error('Delete failed:', err);
          showNotification('Delete failed: ' + err.message,'error');
        }
      };
    });

  } catch (err) {
    console.error('❌ loadReservations error:', err);
    tbody.innerHTML = ''; // clear loading
    showNotification('Could not load reservations: ' + err.message,'error');
  }
}
