// client/js/split.js
import { authedFetch }    from './api.js';
import { showNotification } from './notifier.js';

const $   = s => document.querySelector(s);
const $$$ = s => Array.from(document.querySelectorAll(s));

let orderData;
let shares = [];

// 1) Read & validate orderId
const params  = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
if (!orderId) {
  $('#split-error').textContent = 'Missing orderId in URL';
  throw new Error('Missing orderId');
}

// 2) Load the customer's orders and pick this one
async function loadOrder() {
  const res = await authedFetch('/orders/my');
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Unable to fetch orders');
  }
  const list = await res.json();
  orderData = list.find(o => String(o.id) === orderId);
  if (!orderData) throw new Error(`Order #${orderId} not found`);
}

// 3) Render order preview table
function renderOrder() {
  $('#order-id').textContent = orderData.id;
  const tbody = $('#order-items-table tbody');
  tbody.innerHTML = '';
  let total = 0;

  orderData.items.forEach(item => {
    const price = parseFloat(item.Menu.price);
    const qty   = item.quantity;
    const sub   = price * qty;
    total += sub;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.Menu.name}</td>
      <td>NPR ${price.toFixed(2)}</td>
      <td>${qty}</td>
      <td>NPR ${sub.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });

  $('#order-total').textContent = `NPR ${total.toFixed(2)}`;
}

// 4) Shares UI
function addShare() {
  const id = shares.length + 1;
  shares.push({ id, name: '', items: [] });
  renderShares();
}

function renderShares() {
  const container = $('#shares-container');
  container.innerHTML = '';

  shares.forEach(s => {
    const fs = document.createElement('fieldset');
    fs.id = `share-${s.id}`;
    fs.className = 'mb-3';
    fs.innerHTML = `
      <legend>Share #${s.id}</legend>
      <label>
        Name:
        <input type="text"
               class="input-field"
               name="shareName"
               value="${s.name}"
               data-share-id="${s.id}"
               required />
      </label>
      <div class="share-items mt-2">
        ${orderData.items.map(it => `
          <div class="share-item mb-1">
            <label>
              ${it.Menu.name} (max ${it.quantity}):
              <input type="number"
                     min="0"
                     max="${it.quantity}"
                     step="0.01"
                     value="${(s.items.find(x => x.menuId === it.menuId) || { quantity: 0 }).quantity}"
                     class="input-field"
                     data-share-id="${s.id}"
                     data-menu-id="${it.menuId}" />
            </label>
          </div>
        `).join('')}
      </div>`;
    container.appendChild(fs);
  });

  // wire up name inputs
  $$$('input[name="shareName"]').forEach(inp => {
    inp.oninput = e => {
      const sid = +e.target.dataset.shareId;
      shares.find(x => x.id === sid).name = e.target.value;
    };
  });

  // wire up qty inputs (parseFloat, allow decimals)
  $$$('.share-item input').forEach(inp => {
    inp.oninput = e => {
      const sid = +e.target.dataset.shareId;
      const mid = +e.target.dataset.menuId;
      let val = parseFloat(e.target.value) || 0;
      val = Math.max(0, Math.min(+e.target.max, val));
      const share = shares.find(x => x.id === sid);
      share.items = share.items.filter(x => x.menuId !== mid);
      if (val > 0) share.items.push({ menuId: mid, quantity: val });
    };
  });
}

// 5) Split & render returned bills
async function doSplit() {
  if (!shares.length) {
    showNotification('Add at least one share', 'error');
    return;
  }
  // validate names
  for (const s of shares) {
    if (!s.name.trim()) {
      showNotification(`Share #${s.id} needs a name`, 'error');
      return;
    }
  }
  // validate sums with small float tolerance
  for (const it of orderData.items) {
    const sum = shares.reduce(
      (acc, s) => acc + (s.items.find(x => x.menuId === it.menuId)?.quantity || 0),
      0
    );
    if (Math.abs(sum - it.quantity) > 1e-6) {
      showNotification(
        `Total split of “${it.Menu.name}” must equal ${it.quantity}`,
        'error'
      );
      return;
    }
  }

  try {
    const payload = {
      shares: shares.map(s => ({
        name: s.name,
        items: s.items.map(i => ({
          menuItemId: i.menuId,
          quantity:   i.quantity
        }))
      }))
    };
    const res = await authedFetch(`/bills/${orderId}/split`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || res.statusText);
    }
    const bills = await res.json();
    renderBills(bills);
    showNotification('Bill split created!', 'success');
  } catch (err) {
    showNotification('Split failed: ' + err.message, 'error');
    console.error(err);
  }
}

function renderBills(bills) {
  $('#splitForm').classList.add('hidden');
  $('#do-split-btn').classList.add('hidden');
  $('#billsSection').classList.remove('hidden');

  const list = $('#billsList');
  list.innerHTML = '';

  bills.forEach(b => {
    const li = document.createElement('li');
    li.className = 'card mb-2 p-3 d-flex justify-content-between align-items-center';

    const left = document.createElement('div');
    left.innerHTML = `<strong>${b.name}</strong> — NPR ${(b.amount/100).toFixed(2)}`;

    const right = document.createElement('div');
    if (b.paid) {
      const span = document.createElement('span');
      span.className = 'paid-badge';
      span.innerText = 'Paid';
      right.appendChild(span);
    } else {
      const btn = document.createElement('button');
      btn.dataset.id = b.id;
      btn.className = 'btn btn-sm btn-primary mark-paid';
      btn.innerText = 'Mark Paid';
      right.appendChild(btn);
    }

    li.append(left, right);
    list.appendChild(li);
  });

  $$$('.mark-paid').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      try {
        const r = await authedFetch(`/bills/${id}/pay`, { method: 'POST' });
        if (!r.ok) throw new Error((await r.json()).error);
        const badge = document.createElement('span');
        badge.className = 'paid-badge';
        badge.innerText = 'Paid';
        btn.replaceWith(badge);
        showNotification('Marked paid!', 'success');
      } catch (e) {
        showNotification('Could not mark paid: ' + e.message, 'error');
        console.error(e);
      }
    };
  });
}

// 6) Initialize
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadOrder();
    renderOrder();
    addShare();
    addShare();
    $('#add-share-btn').onclick = addShare;
    $('#do-split-btn').onclick  = doSplit;
  } catch (err) {
    $('#split-error').textContent = err.message;
    console.error(err);
  }
});
