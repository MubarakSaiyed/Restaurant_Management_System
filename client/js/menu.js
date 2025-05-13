import { fetchMenu, authedFetch, getUserRole } from './api.js';
import { showNotification }                  from './notifier.js';
import { validateForm }                      from './validator.js';

if (!localStorage.getItem('jwt')) {
  window.location.href = 'login.html';
}

// global logout hookup
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('role');
  window.location.href = 'login.html';
});

const role = getUserRole();

// 1) Load & render menu
async function loadMenu() {
  try {
    const items = await fetchMenu();
    const list  = document.getElementById('menuList');
    list.innerHTML = '';

    items.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('menu-item');
      li.dataset.id = item.id;

      const span = document.createElement('span');
      span.textContent = `${item.name} — NPR ${item.price.toFixed(2)}`;
      li.append(span);

      // only admins get Edit/Delete
      if (role === 'admin') {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => startEdit(item, li));
        li.append(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => deleteDish(item.id));
        li.append(delBtn);
      }

      list.append(li);
    });
  } catch (err) {
    console.error('❌ loadMenu error:', err);
    showNotification('Could not load menu: ' + err.message, 'error');
  }
}

// 2) Delete
async function deleteDish(id) {
  if (!confirm('Really delete this dish?')) return;
  try {
    await authedFetch(`/menu/${id}`, { method: 'DELETE' });
    showNotification('Dish deleted', 'success');
    await loadMenu();
  } catch (err) {
    console.error('🚨 deleteDish error:', err);
    showNotification('Could not delete dish: ' + err.message, 'error');
  }
}

// 3) Inline edit
function startEdit(item, li) {
  li.innerHTML = '';

  const nameI  = document.createElement('input');
  nameI.value  = item.name;
  li.append(nameI);

  const priceI = document.createElement('input');
  priceI.type  = 'number';
  priceI.value = item.price;
  li.append(priceI);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', async () => {
    const updated = {
      name:  nameI.value,
      price: parseFloat(priceI.value)
    };

    try {
      await authedFetch(`/menu/${item.id}`, {
        method: 'PUT',
        body:   JSON.stringify(updated),
      });
      showNotification('Dish updated', 'success');
      await loadMenu();
    } catch (err) {
      console.error('🚨 edit error:', err);
      showNotification('Could not update dish: ' + err.message, 'error');
    }
  });
  li.append(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', loadMenu);
  li.append(cancelBtn);
}

// 4) Add‐new‐dish form (admins only)
const addForm = document.getElementById('addForm');
if (addForm) {
  addForm.addEventListener('submit', async e => {
    e.preventDefault();

    const errors = validateForm(addForm);
    if (Object.keys(errors).length) return;

    const fd = new FormData(addForm);
    const newDish = {
      name:        fd.get('name'),
      category:    fd.get('category'),
      price:       parseFloat(fd.get('price')),
      description: fd.get('description'),
      available:   fd.get('available') === 'on'
    };

    try {
      await authedFetch('/menu', {
        method: 'POST',
        body:   JSON.stringify(newDish),
      });
      showNotification('Dish added', 'success');
      addForm.reset();
      await loadMenu();
    } catch (err) {
      console.error('🚨 addForm error:', err);
      showNotification('Could not add dish: ' + err.message, 'error');
    }
  });
}

// 5) Kick everything off
document.addEventListener('DOMContentLoaded', () => {
  if (role !== 'admin' && addForm) {
    addForm.style.display = 'none';
  }
  loadMenu();
});
