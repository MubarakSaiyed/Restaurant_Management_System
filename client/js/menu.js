// client/js/menu.js

import { fetchMenu, authedFetch, getUserRole } from './api.js';
import { showNotification }                   from './notifier.js';
import { validateForm }                       from './validator.js';
import { loadCart, saveCart }                 from './cartStorage.js';

const loginLink     = document.getElementById('loginLink');
const logoutBtn     = document.getElementById('logoutBtn');
const adminUI       = document.getElementById('adminUI');
const addForm       = document.getElementById('addForm');
const menuContainer = document.getElementById('menuSections');
const filtersDiv    = document.getElementById('filters');

const role = getUserRole() || 'guest';

;(async function init() {
  // ── Toggle login/logout UI ─────────────────────────
  if (role === 'guest') {
    loginLink.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  } else {
    loginLink.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    logoutBtn.onclick = () => {
      localStorage.clear();
      window.location.href = 'menu.html';
    };
  }

  // ── Admin Add/Edit form ─────────────────────────────
  if (role !== 'admin') {
    adminUI?.classList.add('hidden');
  } else {
    addForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const errs = validateForm(addForm);
      if (Object.keys(errs).length) return;

      const fd = new FormData(addForm);

      try {
        let res;
        if (addForm.dataset.editId) {
          // Edit existing
          const id = addForm.dataset.editId;
          res = await authedFetch(`/menu/${id}`, {
            method: 'PUT',
            body:   fd
          });
        } else {
          // Add new
          res = await authedFetch('/menu', {
            method: 'POST',
            body:   fd
          });
        }

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Save failed');

        showNotification(
          addForm.dataset.editId ? 'Dish updated ✔️' : 'Dish added ✔️',
          'success'
        );

        // Reset form & exit edit mode
        addForm.reset();
        delete addForm.dataset.editId;
        adminUI.querySelector('h3').textContent = 'Add New Dish';
        addForm.querySelector('button').textContent = 'Add Dish';

        await loadMenu();
      } catch (err) {
        showNotification('Save failed: ' + err.message, 'error');
      }
    });
  }

  // ── Initial load ────────────────────────────────────
  await loadMenu();
})();

async function loadMenu() {
  try {
    const items = await fetchMenu();

    // Group by category
    const byCat = items.reduce((g, item) => {
      const cat = item.category || 'Uncategorized';
      (g[cat] = g[cat]||[]).push(item);
      return g;
    }, {});

    // Build filter buttons
    const cats = ['All', ...Object.keys(byCat).sort()];
    filtersDiv.innerHTML = '';
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (cat==='All' ? ' active' : '');
      btn.textContent = cat;
      btn.onclick = () => {
        document.querySelectorAll('.filter-btn')
          .forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.menu-category').forEach(sec => {
          sec.style.display = (cat==='All' || sec.dataset.category===cat)
            ? '' : 'none';
        });
      };
      filtersDiv.append(btn);
    });

    // Render categories & cards
    menuContainer.innerHTML = '';
    for (const [category, list] of Object.entries(byCat)) {
      const sec = document.createElement('section');
      sec.className = 'menu-category';
      sec.dataset.category = category;

      const h3 = document.createElement('h3');
      h3.className = 'category-title';
      h3.textContent = category;
      sec.append(h3);

      const grid = document.createElement('div');
      grid.className = 'menu-grid';

      list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        const content = document.createElement('div');
        content.className = 'card-content';

        // —— IMAGE logic ——
        let imgSrc;
        if (item.imageUrl) {
          imgSrc = item.imageUrl.startsWith('/')
            ? item.imageUrl
            : `/uploads/${item.imageUrl}`;
        } else {
          const f = item.name.replace(/\s+/g,'') + '.jpg';
          imgSrc = `/images/${f}`;
        }
        content.innerHTML = `
          <div class="dish-img-wrap">
            <img src="${imgSrc}"
                 alt="${item.name}"
                 class="dish-img"
                 onerror="this.onerror=null;this.src='/images/logo.jpg';"/>
          </div>
          <h4>${item.name}</h4>
          <p class="text-sm">${item.category}</p>
          <p class="text-lg">NPR ${item.price.toFixed(2)}</p>
          <span class="badge ${item.available ? 'available' : 'unavailable'}">
            ${item.available ? 'Available' : 'Unavailable'}
          </span>
        `;

        const actions = document.createElement('div');
        actions.className = 'card-actions';

        // Add to cart
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add to Cart';
        addBtn.className   = 'add-btn';
        addBtn.disabled    = !item.available;
        addBtn.onclick     = () => {
          const cart = loadCart();
          const found = cart.find(c=>c.menuId===item.id);
          if (found) found.quantity++;
          else cart.push({
            menuId: item.id,
            name:   item.name,
            price:  item.price,
            quantity: 1
          });
          saveCart(cart);
          showNotification(`"${item.name}" added to cart`, 'info');
        };
        actions.append(addBtn);

        // Admin Edit/Delete
        if (role==='admin') {
          const editBtn = document.createElement('button');
          editBtn.textContent = 'Edit';
          editBtn.className = 'edit-btn';
          editBtn.onclick   = () => startEdit(item);
          actions.append(editBtn);

          const delBtn = document.createElement('button');
          delBtn.textContent = 'Delete';
          delBtn.className   = 'delete-btn';
          delBtn.onclick     = () => deleteDish(item.id);
          actions.append(delBtn);
        }

        card.append(content, actions);
        grid.append(card);
      });

      sec.append(grid);
      menuContainer.append(sec);
    }

    // Activate “All”
    document.querySelector('.filter-btn.active').click();

  } catch (err) {
    console.error('Could not load menu:', err);
    showNotification('Could not load menu', 'error');
  }
}

async function deleteDish(id) {
  if (!confirm('Delete this dish?')) return;
  try {
    const res = await authedFetch(`/menu/${id}`, { method: 'DELETE' });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Delete failed');
    showNotification('Dish deleted ✔️','success');
    await loadMenu();
  } catch (err) {
    console.error(err);
    showNotification('Delete failed: '+err.message,'error');
  }
}

function startEdit(item) {
  addForm.elements.name.value        = item.name;
  addForm.elements.category.value    = item.category;
  addForm.elements.price.value       = item.price;
  addForm.elements.description.value = item.description || '';
  addForm.elements.available.checked = item.available;

  addForm.dataset.editId = item.id;
  adminUI.querySelector('h3').textContent = 'Edit Dish';
  addForm.querySelector('button').textContent = 'Save Changes';
  addForm.scrollIntoView({ behavior:'smooth' });
}
