// client/js/cart.js

import { authedFetch, getUserRole } from './api.js';
import { showNotification }         from './notifier.js';
import { loadCart, saveCart }       from './cartStorage.js';

// DOM refs
const loginLink     = document.getElementById('loginLink');
const logoutBtn     = document.getElementById('logoutBtn');
const cartGrid      = document.getElementById('cartGrid');
const orderLaterBtn = document.getElementById('orderLaterBtn');
const payNowBtn     = document.getElementById('payNowBtn');
const splitBillBtn  = document.getElementById('splitBillBtn');
const orderTotalEl  = document.getElementById('orderTotal');
const moodEl        = document.querySelector('.cart-mood p');

// Mood‐boosting micro-copy
const moods = [
  "You’re one step closer to something delicious!",
  "Food is the ingredient that binds us together.",
  "Review your picks—and let the feast begin!",
  "Thanks for dropping by—your taste buds are in for a treat!",
  "All set? Choose “Pay Now” or “Pay Later” and relax!"
];
if (moodEl) {
  moodEl.textContent = moods[Math.floor(Math.random() * moods.length)];
}

// Load persisted cart (or empty array)
let cart = loadCart();

// Role‐based nav links
const role = getUserRole() || 'guest';
if (role === 'guest') {
  loginLink.classList.remove('hidden');
  logoutBtn.classList.add('hidden');
} else {
  loginLink.classList.add('hidden');
  logoutBtn.classList.remove('hidden');
}
logoutBtn.onclick = () => {
  localStorage.clear();
  location.href = 'menu.html';
};

/**
 * Render the cart items & update summary/buttons
 */
function renderCart() {
  cartGrid.innerHTML = '';
  let total = 0;

  cart.forEach((c, idx) => {
    total += c.price * c.quantity;

    const card = document.createElement('div');
    card.className = 'card';

    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = `
      <h4>${c.name}</h4>
      <p>Price: NPR ${c.price.toFixed(2)}</p>
      <p>Qty: ${c.quantity}</p>
      <p>Subtotal: NPR ${(c.price * c.quantity).toFixed(2)}</p>
    `;
    card.append(content);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const decBtn = document.createElement('button');
    decBtn.textContent = '–';
    decBtn.onclick = () => updateQty(idx, c.quantity - 1);
    actions.append(decBtn);

    const incBtn = document.createElement('button');
    incBtn.textContent = '+';
    incBtn.onclick = () => updateQty(idx, c.quantity + 1);
    actions.append(incBtn);

    const remBtn = document.createElement('button');
    remBtn.textContent = 'Remove';
    remBtn.className = 'delete-btn';
    remBtn.onclick = () => removeItem(idx);
    actions.append(remBtn);

    card.append(actions);
    cartGrid.append(card);
  });

  orderTotalEl.textContent = `Total: NPR ${total.toFixed(2)}`;
  const empty = cart.length === 0;
  orderLaterBtn.disabled = empty;
  payNowBtn.disabled     = empty;
  splitBillBtn.disabled  = empty;
}

function updateQty(idx, newQty) {
  if (newQty < 1) return;
  cart[idx].quantity = newQty;
  saveCart(cart);
  renderCart();
  showNotification('Quantity updated', 'success');
}

function removeItem(idx) {
  const removed = cart.splice(idx, 1)[0];
  saveCart(cart);
  renderCart();
  showNotification(`Removed "${removed.name}"`, 'warn');
}

/**
 * 1) Order Later (defer payment)
 */
orderLaterBtn.addEventListener('click', async () => {
  try {
    const res = await authedFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map(c => ({
          menuId: c.menuId,
          quantity: c.quantity
        }))
      })
    });
    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message || 'Unknown error');
    }
    showNotification('Order placed! Pay later at your convenience.', 'success');
    cart = [];
    saveCart(cart);
    renderCart();
  } catch (err) {
    console.error('❌ place order later failed:', err);
    showNotification('Failed to place order: ' + err.message, 'error');
  }
});

/**
 * 2) Pay Now → Stripe flow
 */
payNowBtn.addEventListener('click', () => {
  localStorage.setItem('pendingOrderItems', JSON.stringify(cart));
  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  localStorage.setItem('cartTotalPaisa', Math.round(total * 100).toString());
  window.location.href = 'checkout.html';
});

/**
 * 3) Split Bill → create order then redirect with orderId
 */
splitBillBtn.addEventListener('click', async () => {
  try {
    // Create the order on the server
    const res = await authedFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map(c => ({
          menuId: c.menuId,
          quantity: c.quantity
        }))
      })
    });
    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message || 'Unknown error');
    }

    // Grab the created order so we know its id
    const order = await res.json();

    showNotification('Order placed! Let’s split the bill.', 'success');

    // Clear the cart
    cart = [];
    saveCart(cart);
    renderCart();

    // Redirect to split.html with the orderId in query
    window.location.href = `split.html?orderId=${order.id}`;
  } catch (err) {
    console.error('❌ split bill failed:', err);
    showNotification('Failed to start split-bill: ' + err.message, 'error');
  }
});

/**
 * Expose addToCart globally so menu.html can push items
 */
window.addToCart = function(item) {
  const exists = cart.find(c => c.menuId === item.id);
  if (exists) {
    exists.quantity++;
  } else {
    cart.push({
      menuId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    });
  }
  saveCart(cart);
  renderCart();
  showNotification(`"${item.name}" added to cart`, 'info');
};

// Initial render
renderCart();
