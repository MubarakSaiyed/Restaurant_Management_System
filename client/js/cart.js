import { fetchMenu, authedFetch } from './api.js';
import { showNotification }      from './notifier.js';

if (!localStorage.getItem('jwt')) {
  window.location.href = 'login.html';
}

const menuCatalog = document.getElementById('menuCatalog');
const cartList    = document.getElementById('cartList');
const placeBtn    = document.getElementById('placeOrderBtn');
let cart = []; // { menuId, name, price, quantity }

async function loadCatalog() {
  const items = await fetchMenu();
  menuCatalog.innerHTML = '';
  items.forEach(it => {
    const li = document.createElement('li');
    li.textContent = `${it.name} — NPR ${it.price.toFixed(2)}`;
    const btn = document.createElement('button');
    btn.textContent = 'Add';
    btn.addEventListener('click', () => addToCart(it));
    li.append(btn);
    menuCatalog.append(li);
  });
}

function addToCart(item) {
  const existing = cart.find(c=>c.menuId===item.id);
  if (existing) existing.quantity++;
  else cart.push({ menuId: item.id, name: item.name, price: item.price, quantity: 1 });
  renderCart();
}

function renderCart() {
  cartList.innerHTML = '';
  cart.forEach((c, i) => {
    const li = document.createElement('li');
    li.textContent = `${c.name} x${c.quantity}`;
    // remove button
    const rm = document.createElement('button');
    rm.textContent = '×';
    rm.addEventListener('click', () => { cart.splice(i,1); renderCart(); });
    li.append(rm);
    cartList.append(li);
  });
}

placeBtn.addEventListener('click', async () => {
  if (!cart.length) return showNotification('Cart is empty','error');
  try {
    await authedFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ items: cart.map(c=>({ menuId: c.menuId, quantity: c.quantity })) })
    });
    showNotification('Order placed!','success');
    cart = [];
    renderCart();
  } catch (err) {
    showNotification('Failed: '+err.message, 'error');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();
  renderCart();
});
