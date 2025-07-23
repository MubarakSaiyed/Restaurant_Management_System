// client/js/reservation.js
import { showNotification } from './notifier.js';
import { validateForm }     from './validator.js';
import { getUserRole }      from './api.js';

// ── ELEMENT REFS ─────────────────────────────────────
const form        = document.getElementById('reservationForm');
const tableSelect = document.getElementById('tableSelect');
const loginLink   = document.getElementById('loginLink');
const logoutBtn   = document.getElementById('logoutBtn');
const navLinks    = document.querySelectorAll('.site-nav .nav-link');
const role        = getUserRole() || 'guest';

// ── NAV & AUTH LINKS ─────────────────────────────────
navLinks.forEach(a => {
  if (a.getAttribute('href') === 'reservation.html') {
    a.classList.add('active');
  }
});
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

// ── LOAD / REFRESH TABLE DROPDOWN ────────────────────
// ── LOAD / REFRESH TABLE DROPDOWN ────────────────────
async function loadTables() {
  // reset dropdown
  tableSelect.innerHTML = `
    <option value="" disabled selected>Select a table</option>
  `;

  try {
    const res = await fetch('/api/seating', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load tables');
    const tables = await res.json();

    console.log('Fetched tables:', tables); // <— verify statuses here

    // 1) Add available tables
    tables
      .filter(t => t.status === 'free' || t.status === 'available')
      .forEach(t => {
        const opt = document.createElement('option');
        opt.value       = t.id;
        opt.textContent = `Table ${t.number} (Cap: ${t.capacity})`;
        tableSelect.appendChild(opt);
      });

    // 2) Add reserved tables, disabled
    tables
      .filter(t => t.status === 'reserved')
      .forEach(t => {
        const opt = document.createElement('option');
        opt.disabled    = true;
        opt.textContent = `Table ${t.number} — Already reserved`;
        tableSelect.appendChild(opt);
      });

  } catch (err) {
    console.error('Error loading tables:', err);
  }
}

// initial load
document.addEventListener('DOMContentLoaded', loadTables);

// ── FORM SUBMIT ──────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();

  const errors = validateForm(form);
  if (Object.keys(errors).length) return;

  const fd = new FormData(form);
  const payload = {
    name:      fd.get('name').trim(),
    email:     fd.get('email').trim(),
    phone:     fd.get('phone').trim(),
    date:      fd.get('date'),
    time:      fd.get('time'),
    partySize: parseInt(fd.get('partySize'), 10),
    tableId:   parseInt(fd.get('tableId'), 10)
  };

  try {
    const res = await fetch('/api/reservations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Booking failed');

    showNotification('Table reserved 🎉', 'success');
    form.reset();
    // refresh dropdown so the newly-reserved table moves into the disabled list
    await loadTables();

  } catch (err) {
    console.error('Booking error:', err);
    showNotification('Booking failed: ' + err.message, 'error', 5000);
  }
});
