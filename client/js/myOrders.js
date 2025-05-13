// client/js/myOrders.js

import { authedFetch }      from './api.js';
import { showNotification } from './notifier.js';

// Redirect to login if not authenticated
if (!localStorage.getItem('jwt')) {
  window.location.href = 'login.html';
}

async function loadMyOrders() {
  try {
    // authedFetch already returns the parsed JSON body
    const orders = await authedFetch('/orders/my');
    const ul = document.getElementById('orderList');
    ul.innerHTML = '';

    if (orders.length === 0) {
      ul.innerHTML = '<li>No orders yet.</li>';
      return;
    }

    orders.forEach(order => {
      const li = document.createElement('li');
      const dateStr = new Date(order.createdAt).toLocaleString();
      // Build each line-item
      const itemsHtml = order.items
        .map(item => {
          // note: item.menu (lowercase) holds the included menu record
          const name = item.menu?.name ?? 'Unknown';
          return `<li>${name} × ${item.quantity}</li>`;
        })
        .join('');

      li.innerHTML = `
        <strong>Order #${order.id}</strong> — ${dateStr} — Status: ${order.status}
        <ul>${itemsHtml}</ul>
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error('❌ loadMyOrders error:', err);
    showNotification('Could not load your orders', 'error');
  }
}

// Wire up logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('role');
  window.location.href = 'login.html';
});

// Kick off on page load
document.addEventListener('DOMContentLoaded', loadMyOrders);
