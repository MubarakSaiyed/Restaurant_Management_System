import { authedFetch, getUserRole } from './api.js';

// Grab our floorplan container
const floor  = document.getElementById('floorplan');
// Socket.IO (served by /socket.io/socket.io.js)
const socket = io();
// Could be 'guest' | 'staff' | 'admin'
const role   = getUserRole() || 'guest';

/**
 * Admin‐only: PATCH /api/seating/:id/status
 */
async function updateStatus(tableId, newStatus) {
  const res = await authedFetch(`/seating/${tableId}/status`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ status: newStatus })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Update failed');
  }
}

/**
 * Render each table card.
 * - All users see the number + either “Reserved” or capacity.
 * - Admins additionally get a <select> to flip status.
 */
function renderTables(tables) {
  floor.innerHTML = '';

  tables.forEach(tbl => {
    // card container
    const el = document.createElement('div');
    el.classList.add('table', tbl.status); 
    // tbl.status is one of 'available'|'reserved'|'occupied'

    // 1️⃣ Always show the table number
    const label = document.createElement('strong');
    label.textContent = `Table ${tbl.number}`;
    el.appendChild(label);

    if (role === 'admin') {
      // 2a️⃣ Admin: dropdown to change status
      const select = document.createElement('select');
      ['available','reserved','occupied'].forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.text  = s[0].toUpperCase() + s.slice(1);
        if (s === tbl.status) opt.selected = true;
        select.appendChild(opt);
      });
      select.onchange = async () => {
        try {
          await updateStatus(tbl.id, select.value);
        } catch (err) {
          alert('Could not update status: ' + err.message);
          select.value = tbl.status;
        }
      };
      el.appendChild(select);

    } else {
      // 2b️⃣ Guest/staff: show read‐only status or capacity
      const info = document.createElement('small');
      info.innerHTML = tbl.status === 'reserved'
        ? '<em>Reserved</em>'
        : `Cap: ${tbl.capacity}`;
      el.appendChild(info);
    }

    floor.appendChild(el);
  });
}

/**
 * Fetch & render the full seating chart.
 */
async function loadSeating() {
  try {
    const res = await fetch('/api/seating');
    if (!res.ok) throw new Error('Could not load seating');
    const tables = await res.json();
    renderTables(tables);
  } catch (err) {
    console.error('Seating load error:', err);
    floor.textContent = '⚠️ Error loading seating chart';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSeating();
  socket.on('seating:update', loadSeating);
});
