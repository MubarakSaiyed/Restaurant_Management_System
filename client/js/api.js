// client/js/api.js

/**
 * Base URL for all /api routes.
 * Change this if your backend lives elsewhere.
 */
const API_BASE = 'http://localhost:5000/api';

/**
 * Read & parse JSON, or throw a descriptive error.
 */
async function parseJsonOrThrow(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

/**
 * PUBLIC fetch wrapper (no Authorization header).
 * Throws on non-2xx, with parsed JSON error if available.
 */
export async function publicFetch(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });

  if (!res.ok) {
    let errBody = { message: res.statusText };
    try { errBody = await parseJsonOrThrow(res); } catch {}
    throw new Error(errBody.message || `HTTP ${res.status}`);
  }
  return res;
}

/**
 * AUTHED fetch wrapper:
 * - Attaches Bearer token from localStorage
 * - Redirects to login.html on 401 or 403
 * - Chooses Content-Type based on body type
 */
export async function authedFetch(path, opts = {}) {
  const token = localStorage.getItem('jwt');
  if (!token) {
    localStorage.clear();
    window.location.href = 'login.html';
    throw new Error('No token provided');
  }

  const headers = { Authorization: `Bearer ${token}` };
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: {
      ...headers,
      ...(opts.headers || {})
    }
  });

  if (res.status === 401 || res.status === 403) {
    // either no/expired token or insufficient privileges
    localStorage.clear();
    window.location.href = 'login.html';
    let errBody = { message: res.statusText };
    try { errBody = await parseJsonOrThrow(res); } catch {}
    throw new Error(errBody.message || 'Not authorized');
  }

  return res;
}

/**
 * Convenience: GET /api/menu (public).
 */
export async function fetchMenu() {
  const res = await publicFetch('/menu', { method: 'GET' });
  return res.json();
}

/**
 * Read the user’s saved role.
 */
export function getUserRole() {
  return localStorage.getItem('role');
}

/**
 * For guest‐only endpoints (feedback/loyalty).
 */
export function guestFetch(path, opts = {}) {
  const code = localStorage.getItem('guestCode');
  return fetch(API_BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Guest-Code': code,
      ...(opts.headers || {})
    }
  });
}
