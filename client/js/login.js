// client/js/login.js
import { validateForm }     from './validator.js';
import { showNotification } from './notifier.js';

// 🔑 point this at your real login endpoint:
const LOGIN_URL = '/api/auth/login';

const form       = document.getElementById('loginForm');
const emailInput = form.querySelector('input[name="email"]');
const pwdInput   = form.querySelector('input[name="password"]');
const emailError = form.querySelector('.error-message[data-for="email"]');
const pwdError   = form.querySelector('.error-message[data-for="password"]');
const togglePwd  = document.getElementById('togglePwd');

if (!form) throw new Error('❌ #loginForm not found!');

// Clear inline errors as soon as the user types again
emailInput.addEventListener('input', () => { emailError.textContent = ''; });
pwdInput.addEventListener('input',   () => { pwdError.textContent = ''; });

// Show / hide password
togglePwd.addEventListener('change', () => {
  pwdInput.type = togglePwd.checked ? 'text' : 'password';
});

form.addEventListener('submit', async ev => {
  ev.preventDefault();

  // 1) client‑side required‑field check
  const errors = validateForm(form);
  if (Object.keys(errors).length) return;

  const payload = {
    email:    emailInput.value.trim(),
    password: pwdInput.value
  };

  let res, body;
  try {
    res = await fetch(LOGIN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    body = await res.json().catch(() => ({}));
  } catch (networkErr) {
    console.error('🚨 Network error during login:', networkErr);
    showNotification('Network error — please try again', 'error');
    return;
  }

  console.debug('🔍 login response', res.status, body);

  // 2) Missing‑fields / bad request
  if (res.status === 400) {
    const msg = body.message || 'Email & password are required.';
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

  // 4) Any other server error
  if (!res.ok) {
    const msg = body.message || `Login failed (${res.status})`;
    console.error('🚨 Login error:', msg);
    showNotification(msg, 'error');
    return;
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
  localStorage.setItem('role', role);

  showNotification('Logged in successfully!', 'success');
  setTimeout(() => {
    window.location.href = 'menu.html';
  }, 500);
});
