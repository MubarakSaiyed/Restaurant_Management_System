/**
 * showNotification()
 * Displays a transient toast banner.
 *
 * @param {string} message   The message text
 * @param {'info'|'success'|'warn'|'error'} type  (optional) style variant
 * @param {number} duration  (optional) ms before auto-hide
 */
export function showNotification(
    message,
    type = 'info',
    duration = 3000
  ) {
    const container = document.getElementById('notification');
    if (!container) return;
  
    // Create toast
    const note = document.createElement('div');
    note.classList.add('notification', type);
    note.textContent = message;
  
    container.appendChild(note);
    // trigger CSS animation
    requestAnimationFrame(() => note.classList.add('show'));
  
    // auto-remove after duration
    setTimeout(() => {
      note.classList.remove('show');
      note.addEventListener(
        'transitionend',
        () => note.remove(),
        { once: true }
      );
    }, duration);
  }
  