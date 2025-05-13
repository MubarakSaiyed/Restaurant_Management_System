// client/js/staff.js
import { authedFetch }      from './api.js';
import { showNotification } from './notifier.js';
import { validateForm }     from './validator.js';

// require login
if (!localStorage.getItem('jwt')) {
  window.location.href = 'login.html';
}

// global logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('jwt');
  window.location.href = 'login.html';
});

let editingId = null;

// 1) Load & render
async function loadStaff() {
  const list = document.getElementById('staffList');
  if (!list) return console.error('❌ #staffList not found!');
  list.innerHTML = '';

  try {
    const staffArray = await authedFetch('/staff', { method: 'GET' });
    for (const s of staffArray) {
      const li = document.createElement('li');
      li.textContent = `${s.name} (${s.role}) • Shift: ${s.shiftStart}–${s.shiftEnd} • Wage: NPR ${s.wage.toFixed(2)}`;

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginLeft = '1em';
      editBtn.addEventListener('click', () => startEdit(s));
      li.append(editBtn);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '0.5em';
      delBtn.addEventListener('click', async () => {
        if (!confirm('Really delete this staff member?')) return;
        try {
          await authedFetch(`/staff/${s.id}`, { method: 'DELETE' });
          showNotification('Staff deleted', 'success');
          await loadStaff();
        } catch (err) {
          console.error('🚨 deleteStaff error:', err);
          showNotification('Could not delete staff: ' + err.message, 'error', 5000);
        }
      });
      li.append(delBtn);

      list.append(li);
    }
  } catch (err) {
    console.error('❌ loadStaff error:', err);
    showNotification('Could not load staff: ' + err.message, 'error', 5000);
  }
}

// 2) Fill form for editing
function startEdit(s) {
  editingId = s.id;
  const form = document.getElementById('staffForm');
  if (!form) return console.error('❌ #staffForm not found!');
  form.name.value       = s.name;
  form.role.value       = s.role;
  form.shiftStart.value = s.shiftStart;
  form.shiftEnd.value   = s.shiftEnd;
  form.wage.value       = s.wage;
}

// 3) Handle submit
const form = document.getElementById('staffForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // validate
    const errors = validateForm(form);
    if (Object.keys(errors).length) return;

    const payload = {
      name:       form.name.value.trim(),
      role:       form.role.value.trim(),
      shiftStart: form.shiftStart.value,
      shiftEnd:   form.shiftEnd.value,
      wage:       parseFloat(form.wage.value),
    };

    try {
      if (editingId) {
        await authedFetch(`/staff/${editingId}`, {
          method: 'PUT',
          body:   JSON.stringify(payload),
        });
        showNotification('Staff updated!', 'success');
      } else {
        await authedFetch('/staff', {
          method: 'POST',
          body:   JSON.stringify(payload),
        });
        showNotification('Staff added!', 'success');
      }
      form.reset();
      editingId = null;
      await loadStaff();
    } catch (err) {
      console.error('🚨 staffForm error:', err);
      showNotification('Could not save staff: ' + err.message, 'error', 5000);
    }
  });
}

// 4) Initial load
document.addEventListener('DOMContentLoaded', loadStaff);
