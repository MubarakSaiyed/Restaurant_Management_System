// client/js/api.js

/**
 * Make an authenticated request to /api/*.
 * If no JWT is present, or it’s expired, we clear it & redirect to login.
 * Always returns parsed JSON.
 */
export async function authedFetch(path, opts = {}) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      localStorage.removeItem('jwt');
      window.location.href = 'login.html';
      throw new Error('No JWT found—please log in');
    }
  
    const res = await fetch('http://localhost:5000/api' + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  
    if (res.status === 401) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('role');
      window.location.href = 'login.html';
      throw new Error('Unauthorized—token invalid or expired');
    }
  
    return res.json();
  }
  
  /**
   * Shorthand for GET /api/menu → JSON[]
   */
  export async function fetchMenu() {
    return authedFetch('/menu', { method: 'GET' });
  }
  
  /**
   * Return the currently-logged-in user's role (as stored during login).
   */
  export function getUserRole() {
    return localStorage.getItem('role') || null;
  }
  