// client/js/staff-schedule.js
import { authedFetch, getUserRole } from './api.js';
import { showNotification }         from './notifier.js';

let currentWeekStart; // YYYY-MM-DD

/**
 * Populate only your real “Staff” table members into the dropdown.
 */
async function populateStaffDropdown() {
  const sel = document.getElementById('shiftUser');
  if (!sel) return;

  // show loading text
  sel.innerHTML = `<option value="" disabled selected hidden>Loading…</option>`;

  try {
    // hit your staff endpoint, which only returns actual staff rows
    const res   = await authedFetch('/staff');
    if (!res.ok) throw new Error('Could not fetch staff list');
    const staff = await res.json();

    if (!staff.length) {
      sel.innerHTML = `<option value="" disabled selected hidden>No staff found</option>`;
      return;
    }

    // build the dropdown
    sel.innerHTML = `<option value="" disabled selected hidden>Select staff…</option>`;
    staff.forEach(s => {
      const o = document.createElement('option');
      o.value       = s.id;
      o.textContent = s.name;
      sel.appendChild(o);
    });

  } catch (err) {
    console.error('Could not load staff list:', err);
    sel.innerHTML = `<option value="" disabled selected hidden>Error loading</option>`;
    showNotification('Failed to load staff list', 'error');
  }
}

/**
 * Wire the “Assign Shift” form submission.
 */
function wireShiftForm() {
  const form  = document.getElementById('shiftForm');
  const errEl = document.getElementById('shiftError');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errEl.textContent = '';

    const staffId   = +document.getElementById('shiftUser').value;
    const date      = document.getElementById('shiftDate').value;
    const startTime = document.getElementById('shiftStart').value;
    const endTime   = document.getElementById('shiftEnd').value;

    if (!staffId || !date || !startTime || !endTime) {
      errEl.textContent = 'All fields are required.';
      return;
    }

    try {
      const res = await authedFetch('/shifts', {
        method: 'POST',
        body:   JSON.stringify({ staffId, date, startTime, endTime })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not assign shift');

      showNotification('Shift assigned ✔️', 'success');
      form.reset();
      loadWeek(currentWeekStart);

    } catch (err) {
      console.error('Assign shift error:', err);
      errEl.textContent = err.message;
      showNotification(err.message, 'error');
    }
  });
}

/**
 * Fetch and render one week of shifts.
 */
async function loadWeek(startDate) {
  try {
    const res  = await authedFetch(`/shifts?weekStart=${startDate}`);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Failed to load shifts');
    renderCalendar(body, startDate);
  } catch (err) {
    console.error('Load week error:', err);
    showNotification(err.message, 'error');
    document.getElementById('schedule-error').textContent = err.message;
  }
}

/**
 * Build the calendar grid for Mon→Sun, hours 6–22.
 */
function renderCalendar(shifts, weekStart) {
  currentWeekStart = weekStart;
  const cal       = document.getElementById('calendar');
  cal.innerHTML   = '';

  // Mon–Sun array
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // update “Week of … — …”
  const rangeEl = document.getElementById('week-range');
  if (rangeEl) {
    const opts = { month: 'short', day: 'numeric' };
    rangeEl.textContent =
      `${days[0].toLocaleDateString(undefined, opts)} — ${days[6].toLocaleDateString(undefined, opts)}`;
  }

  // header row
  cal.appendChild(makeCell('header blank',''));
  days.forEach(d => {
    const txt = d.toLocaleDateString(undefined, { weekday:'short', day:'numeric' });
    cal.appendChild(makeCell('header', txt));
  });

  // time rows 6:00–22:00
  for (let hr=6; hr<=22; hr++) {
    cal.appendChild(makeCell('cell time-label', `${hr}:00`));
    days.forEach(d => {
      const iso    = d.toISOString().slice(0,10);
      const cellEl = makeCell('cell','');
      shifts.forEach(s => {
        if (s.date === iso) {
          const [sh] = s.startTime.split(':').map(Number);
          const [eh] = s.endTime.split(':').map(Number);
          if (hr >= sh && hr < eh) {
            const blk = document.createElement('div');
            blk.className   = 'shift-block';
            blk.textContent = s.staff?.name || '—';
            cellEl.appendChild(blk);
          }
        }
      });
      cal.appendChild(cellEl);
    });
  }
}

function makeCell(css, txt) {
  const el = document.createElement('div');
  el.className   = css;
  el.textContent = txt;
  return el;
}

/** shift week by ±7 days **/
function shiftWeek(delta) {
  const d = new Date(currentWeekStart);
  d.setDate(d.getDate() + delta);
  loadWeek(d.toISOString().slice(0,10));
}

// ─ INIT ────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  // only admins may assign shifts
  if (getUserRole() !== 'admin') {
    document.body.innerHTML = '<p class="text-center mt-5">Access denied</p>';
    return;
  }

  await populateStaffDropdown();
  wireShiftForm();

  // compute this week’s Monday
  const now    = new Date();
  const offset = (now.getDay()+6)%7; // Mon=0…Sun=6
  const mon    = new Date(now);
  mon.setDate(now.getDate() - offset);
  currentWeekStart = mon.toISOString().slice(0,10);

  document.getElementById('prev-week').onclick = () => shiftWeek(-7);
  document.getElementById('next-week').onclick = () => shiftWeek(7);

  loadWeek(currentWeekStart);
});
