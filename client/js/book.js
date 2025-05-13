// client/js/book.js
import { authedFetch }     from './api.js';
import { showNotification }from './notifier.js';
import { validateForm }    from './validator.js';

const form = document.getElementById('bookForm');
if (!form) {
  console.error('❌ bookForm not found in DOM!');
} else {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // validate
    const errors = validateForm(form);
    if (Object.keys(errors).length) return;

    const fd = new FormData(form);
    const payload = {
      name:      fd.get('name'),
      email:     fd.get('email'),
      phone:     fd.get('phone'),
      date:      fd.get('date'),
      time:      fd.get('time'),
      partySize: parseInt(fd.get('partySize'), 10)
    };

    try {
      await authedFetch('/reservations', {
        method: 'POST',
        body:   JSON.stringify(payload)
      });
      showNotification('Table reserved! 🎉', 'success');
      form.reset();
    } catch (err) {
      console.error('📌 Book error:', err);
      showNotification('Could not book table: ' + err.message, 'error', 5000);
    }
  });
}
