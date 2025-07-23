// client/js/cartStorage.js

/** Read the cart from localStorage; returns array */
export function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  }
  
  /** Persist the cart array to localStorage */
  export function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  