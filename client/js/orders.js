// client/js/orders.js
import { authedFetch, getUserRole } from './api.js';
import { showNotification }         from './notifier.js';

const listEl         = document.getElementById('ordersList');
const paginationEl   = document.getElementById('pagination');
const loginLink      = document.getElementById('loginLink');
const logoutBtn      = document.getElementById('logoutBtn');
const cancelModal    = document.getElementById('cancelModal');
const confirmCancel  = document.getElementById('confirmCancel');
const declineCancel  = cancelModal.querySelector('.cancel-btn');

const PAGE_SIZE      = 5;
let allOrders        = [];
let orderIdToCancel  = null;
const role           = getUserRole() || 'guest';

const VALID_STATUSES = [
  'new',
  'processing',
  'paid',
  'preparing',
  'in_progress',
  'ready',
  'on_the_way',
  'served'
];

// ─── Redirect guests ─────────────────────────────────────
if (role === 'guest') {
  window.location.href = 'login.html';
  throw new Error('Redirecting to login');
}

// ─── Toggle auth links ──────────────────────────────────
loginLink.classList.add('hidden');
logoutBtn.classList.remove('hidden');
logoutBtn.onclick = () => {
  localStorage.clear();
  window.location.href = 'login.html';
};

// ─── 1) Load + paginate ─────────────────────────────────
async function loadOrders() {
  try {
    const endpoint = role === 'admin' ? '/orders' : '/orders/my';
    const res      = await authedFetch(endpoint);
    if (!res.ok) throw new Error((await res.json()).message || res.status);
    allOrders = await res.json();
    renderPage(1);
    renderPagination();
  } catch (err) {
    console.error(err);
    showNotification('Could not load orders: ' + err.message, 'error');
  }
}

// ─── 2) Pagination helpers ─────────────────────────────
function renderPage(page) {
  const start = (page - 1) * PAGE_SIZE;
  renderOrders(allOrders.slice(start, start + PAGE_SIZE));
  highlightPageButton(page);
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));
  paginationEl.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className   = 'page-btn';
    btn.onclick     = () => renderPage(i);
    paginationEl.append(btn);
  }
}

function highlightPageButton(active) {
  paginationEl
    .querySelectorAll('.page-btn')
    .forEach((b, idx) => b.classList.toggle('active', idx + 1 === active));
}

// ─── 3) Show the cancel‐order dialog ────────────────────
function showCancelDialog(orderId, evt) {
  orderIdToCancel = orderId;

  // use evt.currentTarget to get the <button>
  const btnEl = evt.currentTarget;
  if (!btnEl) return;

  // measure the button’s screen position
  const btnRect = btnEl.getBoundingClientRect();

  // show the dialog so it’s in the DOM
  cancelModal.showModal();

  // now measure the dialog’s size
  const modalRect = cancelModal.getBoundingClientRect();

  // place it just above the button (8px gap)
  cancelModal.style.top  = `${window.scrollY + btnRect.top - modalRect.height - 8}px`;
  cancelModal.style.left = `${window.scrollX + btnRect.left}px`;
}

// ─── 4) “No” button ─────────────────────────────────────
declineCancel.addEventListener('click', () => {
  orderIdToCancel = null;
  cancelModal.close();
});

// ─── 5) “Yes” button ────────────────────────────────────
confirmCancel.addEventListener('click', async () => {
  cancelModal.close();
  if (!orderIdToCancel) return;

  try {
    const res = await authedFetch(`/orders/${orderIdToCancel}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error((await res.json()).message);
    showNotification(`Order #${orderIdToCancel} cancelled`, 'warn');
    await loadOrders();
  } catch (err) {
    console.error(err);
    showNotification('Cancel failed: ' + err.message, 'error');
  } finally {
    orderIdToCancel = null;
  }
});

// ─── 6) Render orders + status/cancel controls ─────────
function renderOrders(orders) {
  listEl.innerHTML = '';
  if (!orders.length) {
    const li = document.createElement('li');
    li.className = 'no-orders';
    li.textContent =
      role === 'admin'
        ? 'No orders have been placed yet.'
        : 'You have no orders yet.';
    listEl.append(li);
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('li');
    card.className = 'order-card';

    // — Header —
    const when = new Date(order.createdAt).toLocaleString('default', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    let custHtml = '';
    if (role === 'admin' && order.customer) {
      custHtml = `<p>Customer: <strong>${order.customer.name}</strong>
                  (${order.customer.email})</p>`;
    }
    const header = document.createElement('header');
    header.innerHTML = `
      <h3>Order #${order.id}</h3>
      <div class="meta">${when}</div>
      ${custHtml}
      <div class="status-container"></div>
    `;
    card.append(header);

    // — Status & (customer) Cancel —
    const sc = header.querySelector('.status-container');
    if (role === 'admin') {
      const select = document.createElement('select');
      select.innerHTML = VALID_STATUSES.map(s => {
        const text = s.replace(/_/g,' ');
        return `<option value="${s}" ${s === order.status ? 'selected' : ''}>
                  ${text.charAt(0).toUpperCase() + text.slice(1)}
                </option>`;
      }).join('');
      select.onchange = async () => {
        try {
          const res = await authedFetch(`/orders/${order.id}`, {
            method: 'PUT',
            body:   JSON.stringify({ status: select.value }),
            headers:{ 'Content-Type':'application/json' }
          });
          if (!res.ok) throw new Error((await res.json()).message);
          showNotification(`Order #${order.id} → ${select.value}`, 'success');
          await loadOrders();
        } catch (err) {
          console.error(err);
          showNotification('Update failed: ' + err.message, 'error');
        }
      };
      sc.append(select);

    } else {
      const span = document.createElement('span');
      span.className = 'badge-status ' + order.status.replace(/_/g,'-');
      span.textContent = order.status.replace(/_/g,' ');
      sc.append(span);

      if (order.status === 'new') {
        const btn = document.createElement('button');
        btn.textContent     = 'Cancel';
        btn.className       = 'badge cancel-btn';
        btn.onclick         = e => showCancelDialog(order.id, e);
        sc.append(btn);
      }
    }

    // — Items Table —
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'card-content';
    bodyDiv.innerHTML = `
      <table class="order-items">
        <thead>
          <tr>
            <th>Dish</th><th>Price</th>
            <th>Qty</th><th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(i => {
            const price = parseFloat(i.Menu?.price || 0);
            return `
              <tr>
                <td>${i.Menu?.name || '–'}</td>
                <td>NPR ${price.toFixed(2)}</td>
                <td>${i.quantity}</td>
                <td>NPR ${(price * i.quantity).toFixed(2)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
    card.append(bodyDiv);

    // — Footer (total) —
    const total = order.items.reduce((sum,i) =>
      sum + parseFloat(i.Menu?.price||0) * i.quantity, 0
    );
    const footer = document.createElement('div');
    footer.className = 'order-footer';
    footer.textContent = `Total: NPR ${total.toFixed(2)}`;
    card.append(footer);

    listEl.append(card);
  });
}

// ─ Kick it all off ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  renderPagination();
  renderPage(1);
});
