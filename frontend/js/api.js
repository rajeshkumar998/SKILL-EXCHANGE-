// api.js — shared fetch helper + auth/session utilities used on every page
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('sep_token');
}
function getUser() {
  const raw = localStorage.getItem('sep_user');
  return raw ? JSON.parse(raw) : null;
}
function saveSession(token, user) {
  localStorage.setItem('sep_token', token);
  localStorage.setItem('sep_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('sep_token');
  localStorage.removeItem('sep_user');
}
function requireAuth() {
  if (!getToken()) window.location.href = 'login.html';
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

// Renders the shared navbar; call on every page with the current page id.
function renderNavbar(activePage) {
  const el = document.getElementById('navbar');
  if (!el) return;
  const user = getUser();

  const links = user
    ? `
      <a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
      <a href="browse.html" class="${activePage === 'browse' ? 'active' : ''}">Browse Skills</a>
      <a href="requests.html" class="${activePage === 'requests' ? 'active' : ''}">Requests</a>
      <a href="profile.html?id=${user.id}" class="${activePage === 'profile' ? 'active' : ''}">My Profile</a>
      <button id="logoutBtn">Logout (${user.name})</button>
    `
    : `
      <a href="login.html">Login</a>
      <a href="register.html"><button class="btn small">Sign Up</button></a>
    `;

  el.innerHTML = `
    <a href="index.html" class="brand">Skill<span>Exchange</span></a>
    <div class="nav-links">${links}</div>
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  }
}
