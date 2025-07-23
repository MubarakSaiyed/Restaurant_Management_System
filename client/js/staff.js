// client/js/staff.js
import { authedFetch, getUserRole } from './api.js';
import { showNotification }         from './notifier.js';
import { validateForm }             from './validator.js';

const loginLink      = document.getElementById('loginLink');
const logoutBtn      = document.getElementById('logoutBtn');
const staffForm      = document.getElementById('staffForm');
const staffTableBody = document.querySelector('#staffTable tbody');
const manageSection  = document.getElementById('manageSection');
const listSection    = document.getElementById('listSection');
const navLinks       = document.querySelectorAll('.site-nav .nav-link');

let editingId = null;
let staffCache = [];  // ← our in-memory cache

// 1) Highlight nav
navLinks.forEach(a => {
  if (a.getAttribute('href') === 'staff.html') a.classList.add('active');
});

// 2) Auth / redirect if guest
const role = getUserRole() || 'guest';
if (role === 'guest') {
  window.location.href = 'login.html';
  throw new Error('Redirecting to login');
}

loginLink.classList.add('hidden');
logoutBtn.classList.remove('hidden');
logoutBtn.onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};

// 3) Only admin may manage staff
if (role !== 'admin') {
  showNotification('Access denied: Admins only', 'error');
  manageSection.style.display = 'none';
  listSection.style.display   = 'none';
} else {
  // after DOM ready
  document.addEventListener('DOMContentLoaded', loadStaffList);
}

/**
 * Load entire staff list, cache it, and render table
 */
async function loadStaffList() {
  try {
    const res        = await authedFetch('/staff', { method: 'GET' });
    if (!res.ok) throw new Error(`Load failed (${res.status})`);
    staffCache = await res.json();

    staffTableBody.innerHTML = '';

    if (!Array.isArray(staffCache) || staffCache.length === 0) {
      const tr = staffTableBody.insertRow();
      const td = tr.insertCell();
      td.colSpan     = 8;
      td.textContent = 'No staff members found.';
      return;
    }

    // build rows
    staffCache.forEach(s => {
      const row = staffTableBody.insertRow();
      row.innerHTML = `
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.phone}</td>
        <td>${s.role}</td>
        <td>${s.shiftStart || '—'}</td>
        <td>${s.shiftEnd   || '—'}</td>
        <td>${s.wage != null ? s.wage.toFixed(2) : '—'}</td>
        <td>
          <button class="edit-btn"   data-id="${s.id}">Edit</button>
          <button class="delete-btn" data-id="${s.id}">Delete</button>
        </td>
      `;
    });

    // wire up buttons
    staffTableBody
      .querySelectorAll('.edit-btn')
      .forEach(btn => btn.addEventListener('click', onEdit));
    staffTableBody
      .querySelectorAll('.delete-btn')
      .forEach(btn => btn.addEventListener('click', onDelete));

  } catch (err) {
    console.error('❌ loadStaffList error:', err);
    showNotification('Could not load staff: ' + err.message, 'error');
  }
}

/** Delete staff member */
async function onDelete(ev) {
  const id = ev.currentTarget.dataset.id;
  if (!confirm('Delete this staff member?')) return;
  try {
    const res = await authedFetch(`/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
    showNotification('Staff deleted', 'success');
    loadStaffList();
  } catch (err) {
    console.error('❌ onDelete error:', err);
    showNotification('Could not delete: ' + err.message, 'error');
  }
}

/** Edit existing staff → populate form from cache */
function onEdit(ev) {
  const id = Number(ev.currentTarget.dataset.id);
  const s  = staffCache.find(x => x.id === id);
  if (!s) {
    console.error('No staff found in cache for id', id);
    showNotification('Staff record not found', 'error');
    return;
  }

  // pre-fill the form
  staffForm.name.value       = s.name;
  staffForm.email.value      = s.email;
  staffForm.phone.value      = s.phone;
  staffForm.role.value       = s.role;
  staffForm.shiftStart.value = s.shiftStart || '';
  staffForm.shiftEnd.value   = s.shiftEnd   || '';
  staffForm.wage.value       = s.wage != null ? s.wage : '';

  editingId = id;
}

/**
 * Form Submit → POST (new) or PUT (edit)
 */
staffForm.addEventListener('submit', async e => {
  e.preventDefault();

  // validate
  const errs = validateForm(staffForm);
  if (Object.keys(errs).length) return;

  // build payload
  const payload = {
    name:       staffForm.name.value.trim(),
    email:      staffForm.email.value.trim(),
    phone:      staffForm.phone.value.trim(),
    role:       staffForm.role.value,
    shiftStart: staffForm.shiftStart.value || null,
    shiftEnd:   staffForm.shiftEnd.value   || null,
    wage:       staffForm.wage.value
                   ? parseFloat(staffForm.wage.value)
                   : null
  };

  // decide endpoint & method
  const method = editingId ? 'PUT' : 'POST';
  const path   = editingId
    ? `/staff/${editingId}`
    : '/staff';

  try {
    const res = await authedFetch(path, {
      method,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Save failed (${res.status})`);
    }

    showNotification(
      editingId ? 'Staff updated!' : 'Staff added!',
      'success'
    );

    staffForm.reset();
    editingId = null;
    loadStaffList();
  } catch (err) {
    console.error('❌ staffForm submit error:', err);
    showNotification('Could not save staff: ' + err.message, 'error');
  }
});

// after your existing form/setup code, add:

const scheduleBtn = document.getElementById('open-schedule-btn');
if (scheduleBtn) {
  scheduleBtn.addEventListener('click', () => {
    // jump to your standalone scheduler
    window.location.href = 'staff-schedule.html';
  });
}

