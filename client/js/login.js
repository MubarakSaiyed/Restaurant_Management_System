// client/js/login.js
import { showNotification } from './notifier.js';
import { validateForm }     from './validator.js';

const form = document.getElementById('loginForm');
if (!form) console.error('❌ loginForm not found in DOM!');

form.addEventListener('submit', async e => {
  e.preventDefault();

  // 1) run your validator
  const errors = validateForm(form);
  if (Object.keys(errors).length) return;

  const data = {
    email:    form.email.value.trim(),
    password: form.password.value
  };

  try {
    const res  = await fetch('http://localhost:5000/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    });
    const body = await res.json();

    if (!res.ok) {
      throw new Error(body.message || 'Login failed');
    }

    // store JWT
    localStorage.setItem('jwt', body.token);

    // decode role out of token payload
    const payload = JSON.parse(atob(body.token.split('.')[1]));
    // assume your JWT has a "role" claim e.g. { sub: "...", role: "admin" }
    localStorage.setItem('role', payload.role || 'user');

    showNotification('Logged in successfully!', 'success');
    setTimeout(() => window.location.href = 'menu.html', 500);

  } catch (err) {
    console.error('🚨 Login error:', err);
    showNotification('Login failed: ' + err.message, 'error');
  }
});
