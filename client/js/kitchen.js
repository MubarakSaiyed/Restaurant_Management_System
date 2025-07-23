// client/js/kitchen.js
import { authedFetch }    from './api.js';
import { showNotification } from './notifier.js';

// redirect if not logged in
if (!localStorage.getItem('jwt')) {
  window.location.href = 'login.html';
}

async function loadOrders() {
  try {
    // Fetch orders (ensure your backend returns items with included Menu data)
    const res = await authedFetch('/orders');
    const orders = await res.json();

    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = ''; // clear

    if (orders.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4">No orders available.</td>';
      tbody.append(tr);
      return;
    }

    orders.forEach(order => {
      // build items description
      const itemsDesc = order.items
        .map(i => `${i.Menu.name} × ${i.quantity}`)
        .join(', ');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.id}</td>
        <td>${itemsDesc}</td>
        <td><span class="status">${order.status.replace('_', ' ')}</span></td>
        <td class="actions"></td>
      `;
      tbody.append(tr);

      const actionCell = tr.querySelector('.actions');
      renderActionButton(order.status, order.id, actionCell);
    });
  } catch (err) {
    console.error(err);
    showNotification('Could not load orders.', 'error');
  }
}

function renderActionButton(status, orderId, container) {
  let label, nextStatus;

  switch (status) {
    case 'pending':
      label = 'Start';
      nextStatus = 'in_progress';
      break;
    case 'in_progress':
      label = 'Mark Ready';
      nextStatus = 'ready';
      break;
    case 'ready':
      label = 'Mark Served';
      nextStatus = 'served';
      break;
    default:
      // no action for served/completed orders
      return;
  }

  const btn = document.createElement('button');
  btn.textContent = label;
  btn.addEventListener('click', async () => {
    try {
      const res = await authedFetch(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      const updated = await res.json();
      showNotification(
        `Order #${orderId} → ${updated.status.replace('_', ' ')}`,
        'success'
      );
      loadOrders(); // refresh list
    } catch (err) {
      console.error(err);
      showNotification('Failed to update status.', 'error');
    }
  });

  container.append(btn);
}

// initialize on DOM ready
document.addEventListener('DOMContentLoaded', loadOrders);
