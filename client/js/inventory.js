// client/js/inventory.js

import { authedFetch, getUserRole } from './api.js';
import { showNotification } from './notifier.js';

const tbody = document.querySelector('#inventoryTable tbody');
const role = getUserRole() || 'guest';

// Redirect non-staff/admin
if (!['admin','staff'].includes(role)) {
  window.location.href = 'login.html';
}

async function loadInventory() {
  try {
    const res = await authedFetch('/inventory');
    const items = await res.json();
    renderTable(items);
  } catch (err) {
    showNotification('Could not load inventory', 'error');
  }
}

function renderTable(items) {
  tbody.innerHTML = '';
  items.forEach(item => {
    const tr = tbody.insertRow();
    tr.className = item.stock === 0
      ? 'stock-zero'
      : (item.stock < 5 ? 'stock-low' : '');

    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>NPR ${item.price.toFixed(2)}</td>
      <td>
        <input type="number"
               class="btn-stock-input"
               data-id="${item.id}"
               min="0" value="${item.stock}" />
      </td>
      <td>
        <button class="btn-stock-save" data-id="${item.id}">
          Save
        </button>
      </td>`;
  });

  tbody.querySelectorAll('.btn-stock-save').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const input = tbody.querySelector(`input[data-id="${id}"]`);
      const stock = parseInt(input.value, 10);

      try {
        await authedFetch(`/inventory/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ stock })
        });
        showNotification('Stock updated', 'success');
        loadInventory();
      } catch (err) {
        showNotification('Update failed', 'error');
      }
    };
  });
}

document.addEventListener('DOMContentLoaded', loadInventory);
