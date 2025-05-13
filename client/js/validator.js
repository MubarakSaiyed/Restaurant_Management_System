// client/js/validator.js

/**
 * Validate a single field and show/hide its error message.
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field
 * @returns {string|null} the error message, or null if valid
 */
export function validateField(field) {
    // find or create the adjacent <span class="error">
    let errorSpan = field.nextElementSibling;
    if (!errorSpan || !errorSpan.classList.contains('error')) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error';
      field.insertAdjacentElement('afterend', errorSpan);
    }
  
    // clear any previous error
    errorSpan.textContent = '';
  
    // HTML5 validity API
    if (field.validity.valid) {
      return null;
    }
  
    let message = '';
    if (field.validity.valueMissing) {
      message = 'This field is required';
    } else if (field.validity.typeMismatch) {
      message = `Please enter a valid ${field.type}`;
    } else if (field.validity.patternMismatch) {
      message = 'Please match the requested format';
    } else if (field.validity.tooShort) {
      message = `Must be at least ${field.minLength} characters`;
    } else if (field.validity.tooLong) {
      message = `Must be at most ${field.maxLength} characters`;
    }
  
    errorSpan.textContent = message;
    return message;
  }
  
  /**
   * Validate all fields in a form.
   * @param {HTMLFormElement} form
   * @returns {Object} an object mapping field names to error messages (empty if valid)
   */
  export function validateForm(form) {
    const errors = {};
    // include inputs, selects, textareas that have the "required" attribute or pattern, etc.
    Array.from(form.elements).forEach(el => {
      if (
        el.tagName === 'INPUT' ||
        el.tagName === 'SELECT' ||
        el.tagName === 'TEXTAREA'
      ) {
        const err = validateField(el);
        if (err) {
          errors[el.name] = err;
        }
      }
    });
    return errors;
  }
  
  // Wire up live validation on all forms on page load
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
      Array.from(form.elements).forEach(field => {
        if (
          field.tagName === 'INPUT' ||
          field.tagName === 'SELECT' ||
          field.tagName === 'TEXTAREA'
        ) {
          field.addEventListener('input', () => validateField(field));
          field.addEventListener('blur', () => validateField(field));
        }
      });
    });
  });
  