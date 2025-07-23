// client/js/feedback-loyalty.js
import { authedFetch }   from './api.js';
import { showNotification } from './notifier.js';

const GUEST_CODE_KEY = 'guestCode';

// 1) generate or re-use an 8-char code
function getOrCreateGuestCode() {
  let code = localStorage.getItem(GUEST_CODE_KEY);
  if (!code) {
    code = crypto.randomUUID().split('-')[0];
    localStorage.setItem(GUEST_CODE_KEY, code);
  }
  return code;
}

// 2) display it
function displayGuestCode(code) {
  const e = document.getElementById('guestCode');
  if (e) e.textContent = code;
}

// 3) copy button
function wireCopyButton() {
  const btn = document.getElementById('copyCodeBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('guestCode').textContent)
      .then(() => showNotification('Code copied!', 'success'))
      .catch(() => showNotification('Copy failed', 'error'));
  });
}

// 4) “Use Code” for returning guests
function wireUpdateCodeButton() {
  const btn = document.getElementById('updateCodeBtn');
  const inp = document.getElementById('enterGuestCode');
  if (!btn || !inp) return;

  btn.addEventListener('click', () => {
    const v = inp.value.trim();
    if (!v) return showNotification('Paste a code first', 'error');
    localStorage.setItem(GUEST_CODE_KEY, v);
    displayGuestCode(v);
    showNotification('Using your code', 'success');
    refreshPoints(v);
  });
}

// 5) load their points
async function refreshPoints(guestCode) {
  try {
    const res  = await authedFetch(`/loyalty?guestCode=${guestCode}`);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Could not load points');
    document.getElementById('pointsDisplay').textContent = body.points;
  } catch (err) {
    console.error('refreshPoints error', err);
    document.getElementById('pointsDisplay').textContent = '—';
    showNotification(err.message, 'error');
  }
}

// 6) wire feedback form
function wireFeedbackForm(guestCode) {
  const form = document.getElementById('feedbackForm');
  const err  = document.getElementById('fbError');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.textContent = '';

    const rating  = +document.getElementById('fbRating').value;
    const comment = document.getElementById('fbComment').value.trim();

    try {
      const res = await authedFetch('/feedback', {
        method: 'POST',
        body:   JSON.stringify({ guestCode, rating, comment })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Submit failed');

      showNotification(`Thanks! +${body.pointsAwarded} pts`, 'success');
      form.reset();
      refreshPoints(guestCode);
    } catch (err2) {
      console.error('Feedback error', err2);
      err.textContent = err2.message;
      showNotification(err2.message, 'error');
    }
  });
}

// 7) wire redeem
function wireRedeemButton(guestCode) {
  const btn = document.getElementById('redeemBtn');
  const err = document.getElementById('redeemError');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    err.textContent = '';
    try {
      const res = await authedFetch('/loyalty/redeem', {
        method: 'POST',
        body:   JSON.stringify({ guestCode, pointsToRedeem: 10 })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Redeem failed');

      showNotification(`Redeemed → NPR ${body.discount}`, 'success');
      refreshPoints(guestCode);
    } catch (err2) {
      console.error('Redeem error', err2);
      err.textContent = err2.message;
      showNotification(err2.message, 'error');
    }
  });
}

// ─ INIT ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const code = getOrCreateGuestCode();
  displayGuestCode(code);
  wireCopyButton();
  wireUpdateCodeButton();
  wireFeedbackForm(code);
  wireRedeemButton(code);
  refreshPoints(code).catch(console.error);
});
