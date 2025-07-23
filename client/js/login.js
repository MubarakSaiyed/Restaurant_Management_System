// client/js/login.js
import { validateForm }     from './validator.js';
import { showNotification } from './notifier.js';

// If your API is elsewhere, update this:
const API_BASE = 'http://localhost:5000/api';

const form        = document.getElementById('loginForm');
const emailInput  = form.querySelector('input[name="email"]');
const pwdInput    = form.querySelector('input[name="password"]');
const emailError  = form.querySelector('.error-message[data-for="email"]');
const pwdError    = form.querySelector('.error-message[data-for="password"]');

if (!form) throw new Error('❌ #loginForm not found!');

// clear inline errors on input
emailInput.addEventListener('input', () => { emailError.textContent = ''; });
pwdInput.addEventListener('input',   () => { pwdError.textContent = ''; });

form.addEventListener('submit', async ev => {
  ev.preventDefault();

  // 1) client-side validation (required fields)
  const errors = validateForm(form);
  if (Object.keys(errors).length) return;

  const payload = {
    email:    emailInput.value.trim(),
    password: pwdInput.value
  };

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });

    const body = await res.json().catch(() => ({}));

    // 2) Missing fields
    if (res.status === 400) {
      const msg = body.message || body.error || 'Email & password are required.';
      // if it mentions email, show under email
      if (msg.toLowerCase().includes('email')) {
        emailError.textContent = msg;
      } else {
        pwdError.textContent = msg;
      }
      return;
    }

    // 3) Invalid credentials
    if (res.status === 401) {
      const msg = 'Invalid email or password.';
      pwdError.textContent = msg;
      showNotification(msg, 'error');
      return;
    }

    // 4) Other server errors
    if (!res.ok) {
      throw new Error(body.message || body.error || `Login failed (${res.status})`);
    }

    // 5) Success → store token & role
    const { token, role: explicitRole } = body;
    localStorage.setItem('jwt', token);

    let role = explicitRole;
    if (!role && token) {
      try {
        const payloadSeg = token.split('.')[1];
        role = JSON.parse(atob(payloadSeg)).role || 'guest';
      } catch {
        role = 'guest';
      }
    }
    localStorage.setItem('role', role || 'guest');

    showNotification('Logged in successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'menu.html';
    }, 500);

  } catch (err) {
    console.error('🚨 Login error:', err);
    showNotification(err.message || 'Server error during login', 'error', 5000);
  }
});
