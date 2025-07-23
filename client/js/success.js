// client/js/success.js

// clear out the pending cart data
localStorage.removeItem('pendingOrderItems');
localStorage.removeItem('cartTotalPaisa');

// nav auth toggle (optional)
const role = localStorage.getItem('role') || 'guest';
if (role !== 'admin') {
  document.getElementById('logoutBtn').classList.remove('hidden');
  document.getElementById('loginLink').classList.add('hidden');
}
document.getElementById('logoutBtn').onclick = () => {
  localStorage.clear();
  window.location.href = 'menu.html';
};

// “View My Orders” button
document.getElementById('viewOrders').addEventListener('click', () => {
  window.location.href = 'orders.html';
});
