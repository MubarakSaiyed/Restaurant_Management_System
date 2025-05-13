// client/js/notifier.js

/**
 * Show a temporary banner at top of page.
 * @param {string} message   The text to display
 * @param {'info'|'success'|'warn'|'error'} type  Which style to apply
 * @param {number} duration  Milliseconds before auto‐hide
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Find (or bail if missing) the container
    const container = document.getElementById('notification');
    if (!container) {
      console.warn('No #notification container found');
      return;
    }
  
    // Create the message element
    const note = document.createElement('div');
    note.classList.add('notification', type);
    note.textContent = message;
  
    // Append & trigger CSS animation
    container.appendChild(note);
    // Force a reflow so that the .show class transition runs
    requestAnimationFrame(() => note.classList.add('show'));
  
    // After `duration`, fade out then remove
    setTimeout(() => {
      note.classList.remove('show');
      note.addEventListener(
        'transitionend',
        () => {
          note.remove();
        },
        { once: true }
      );
    }, duration);
  }
  