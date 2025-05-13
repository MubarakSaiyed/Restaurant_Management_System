import { authedFetch } from './api.js';
import { showNotification } from './notifier.js';

if (!localStorage.getItem('jwt')) location.href = 'login.html';

async function loadOrders() {
  try {
    const orders = await authedFetch('/orders').then(r => r.json());
    const ul = document.getElementById('kitchenList');
    ul.innerHTML = '';

    if (!orders.length) {
      ul.innerHTML = '<li>No orders.</li>';
      return;
    }

    orders.forEach(o => {
      const li = document.createElement('li');
      li.dataset.id = o.id;
      li.innerHTML = `
        <strong>#${o.id}</strong> —
        ${new Date(o.createdAt).toLocaleString()} —
        Status: <span class="status">${o.status}</span>
        <ul>${o.items.map(i =>
          `<li>${i.Menu.name} × ${i.quantity}</li>`
        ).join('')}</ul>
      `;

      // status buttons
      ['in_progress','ready','served'].forEach(s => {
        const btn = document.createElement('button');
        btn.textContent = s.replace('_',' ');
        btn.onclick = async () => {
          try {
            const res = await authedFetch(`/orders/${o.id}`, {
              method: 'PUT',
              body: JSON.stringify({ status: s })
            });
            const updated = await res.json();
            li.querySelector('.status').textContent = updated.status;
            showNotification(`Order #${o.id} → ${updated.status}`, 'success');
          } catch (err) {
            showNotification('Could not update status', 'error');
            console.error(err);
          }
        };
        li.append(btn);
      });

      ul.append(li);
    });
  } catch (err) {
    showNotification('Could not load orders', 'error');
    console.error(err);
  }
}

document.getElementById('logoutBtn').onclick = () => {
  localStorage.clear();
  location.href = 'login.html';
};

document.addEventListener('DOMContentLoaded', loadOrders);
