// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE?.trim() ||
  'https://saglikta-7d7a2dbc0cf4.herokuapp.com';

const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH?.trim() || '/logUser/loginUser';
const REGISTER_PATH = import.meta.env.VITE_REGISTER_PATH?.trim() || '/logUser/signupUser';
const CHATS_PATH = import.meta.env.VITE_CHATS_PATH?.trim() || '/chats/getAllChat';

const ALLOWED_ROLES = new Set(['doctor', 'user']);

async function fetchJson(url, options = {}, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const msg = data?.message || data?.error || `İstek başarısız (HTTP ${res.status})`;
      throw new Error(msg);
    }
    return data ?? {};
  } finally {
    clearTimeout(id);
  }
}

export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error('E-posta ve şifre zorunludur.');
  const url = `${API_BASE}${LOGIN_PATH}`;
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!data?.token) throw new Error('Sunucudan geçersiz yanıt: token yok.');
  return data;
}

// signup: { name, surname, dateOfBirth, role: 'doctor'|'user', email, password }
export async function registerUser({ name, surname, dateOfBirth, role, email, password }) {
  if (!name || !surname || !dateOfBirth || !role || !email || !password) {
    throw new Error('Tüm alanlar zorunludur.');
  }
  const normRole = String(role).toLowerCase();
  if (!ALLOWED_ROLES.has(normRole)) throw new Error('Geçersiz rol. Sadece "doctor" veya "user" olabilir.');

  const url = `${API_BASE}${REGISTER_PATH}`;
  const payload = { name, surname, dateOfBirth, role: normRole, email, password };

  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return data;
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function getAllChats(token) {
  if (!token) throw new Error('Oturum bulunamadı.');
  const url = `${API_BASE}${CHATS_PATH}`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  });
  return Array.isArray(data) ? data : [];
}

export async function getUserProfile(token) {
  if (!token) throw new Error('Oturum bulunamadı.');
  const url = `${API_BASE}/user/loggedUser`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  });
  return data;
}

export async function getDoctorProfile(token, userID) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!userID) throw new Error('Kullanıcı ID gerekli.');
  const url = `${API_BASE}/doctor/doctor?userID=${userID}`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  });
  return data;
}

// 👇 USER rolü için public profil (token'lı)
export async function getPublicUserProfile(token, userID) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!userID) throw new Error('Kullanıcı ID gerekli.');
  const url = `${API_BASE}/publicUser/publicUser?userID=${userID}`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  });
  return data;
}

// 👇 Belirli bir userID'nin gönderileri (token'lı)
export async function getChatsByUserID(token, userID) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!userID) throw new Error('Kullanıcı ID gerekli.');
  const url = `${API_BASE}/chats/getChats?userID=${userID}`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  });
  return Array.isArray(data) ? data : [];
}


export { API_BASE };
