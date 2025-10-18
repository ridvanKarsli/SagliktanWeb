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

// --- Disease APIs ---

/**
 * Hastalık isimlerini döner: ["Astım", "Diyabet", ...]
 */
export async function getDiseaseNames(token, { signal } = {}) {
  const res = await fetch('https://saglikta-7d7a2dbc0cf4.herokuapp.com/disease/getDiseaseNames', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    signal
  });

  let data = null;
  try { data = await res.json(); } catch { /* noop */ }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `İstek başarısız (HTTP ${res.status})`;
    throw new Error(msg);
  }

  // Güvenli uniq + A→Z sıralama (TR locale)
  const list = Array.isArray(data) ? data : [];
  const uniq = Array.from(new Set(list));
  uniq.sort((a, b) => a.localeCompare(b, 'tr'));
  return uniq;
}

/**
 * Yeni hastalık ekler: { name, dateOfDiagnosis }
 */
export async function addDisease(token, payload) {
  const res = await fetch('https://saglikta-7d7a2dbc0cf4.herokuapp.com/disease/addDisease', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try { data = await res.json(); } catch { /* noop */ }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `İstek başarısız (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return data; // ör: { diseaseID: ... } veya API’nin döndürdüğü obje
}

// --- Doctor: Specialization Add ---
export async function addSpecialization(token, payload, { signal } = {}) {
  // payload: { nameOfSpecialization: string, specializationExperience: number }
  const res = await fetch(
    'https://saglikta-7d7a2dbc0cf4.herokuapp.com/specialization/addSpecialization',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal,
    }
  )

  let data = null
  try { data = await res.json() } catch { /* no-op */ }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  }
  return data // { specializationID?, nameOfSpecialization, specializationExperience, ... }
}

// --- Doctor: Specialization Delete ---
export async function deleteSpecialization(token, specializationID, { signal } = {}) {
  if (!specializationID) throw new Error('specializationID gerekli.')

  const url = `https://saglikta-7d7a2dbc0cf4.herokuapp.com/specialization/deleteSpecialization?specializationID=${encodeURIComponent(specializationID)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })

  let data = null
  try { data = await res.json() } catch { /* no-op */ }

  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  return data || { ok: true }
}

// --- Doctor: Work Address Add ---
export async function addWorkAddress(token, payload, { signal } = {}) {
  // payload: { workPlaceName, street, city, county, country }
  const res = await fetch(
    'https://saglikta-7d7a2dbc0cf4.herokuapp.com/workAddress/addWorkAddress',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal,
    }
  )

  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  return data // { addressID?, ... }
}

// --- Doctor: Work Address Delete ---
export async function deleteWorkAddress(token, addressID, { signal } = {}) {
  if (!addressID) throw new Error('addressID gerekli.')

  const url = `https://saglikta-7d7a2dbc0cf4.herokuapp.com/workAddress/deleteWorkAddress?addressID=${encodeURIComponent(addressID)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })

  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  return data || { ok: true }
}

// --- Doctor: Contact Add ---
export async function addContactInfor(token, payload, { signal } = {}) {
  // payload: { email: string, phoneNumber: string }
  const res = await fetch(
    'https://saglikta-7d7a2dbc0cf4.herokuapp.com/contactInfor/addContactInfor',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal,
    }
  )

  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  return data // { contactID?, email, phoneNumber, ... }
}

// --- Doctor: Contact Delete ---
export async function deleteContact(token, contactID, { signal } = {}) {
  if (!contactID) throw new Error('contactID gerekli.')

  const url = `https://saglikta-7d7a2dbc0cf4.herokuapp.com/contactInfor/deleteContact?contactID=${encodeURIComponent(contactID)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })

  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  return data || { ok: true }
}

// --- Doctor: Announcement Add ---
export async function addAnnouncement(token, payload, { signal } = {}) {
  // payload: { title, content, uploadDate: "YYYY-MM-DD" }
  const res = await fetch(
    'https://saglikta-7d7a2dbc0cf4.herokuapp.com/announcement/addAnnouncement',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal,
    }
  )

  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  return data // { announcementID?, title, content, uploadDate, ... }
}

// --- Doctor: Announcement Delete ---
export async function deleteAnnouncement(token, announcementID, { signal } = {}) {
  if (!announcementID) throw new Error('announcementID gerekli.')

  const url = `https://saglikta-7d7a2dbc0cf4.herokuapp.com/announcement/deleteAnnouncement?announcementID=${encodeURIComponent(announcementID)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })

  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  return data || { ok: true }
}

export async function deleteChat(token, chatID) {
  if (!token) throw new Error('Token gerekli');
  if (!chatID) throw new Error('chatID gerekli');

  // Sunucu DELETE desteklemiyorsa method'u 'GET' yapabilirsiniz.
  const url = `${API_BASE}/chats/deleteChat?chatID=${encodeURIComponent(chatID)}`;

  const res = await fetch(url, {
    method: 'DELETE', // Gerekirse 'GET' yapın
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Silme başarısız (HTTP ${res.status})`);
  }
  // Bazı endpoint’ler boş dönebilir; güvenli olsun
  try { return await res.json(); } catch { return true; }
}

export async function addComment(token, chatID, message) {
  const res = await fetch('https://saglikta-7d7a2dbc0cf4.herokuapp.com/comments/addComment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, chatID })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Yorum eklenemedi.')
  }
  return res.json().catch(() => ({}))
}



export async function deleteComment(token, commnetsID) {
  // DİKKAT: endpoint param adı "commnetsID" (yazım bu şekilde)
  const res = await fetch(
    `https://saglikta-7d7a2dbc0cf4.herokuapp.com/comments/deleteComment?commnetsID=${encodeURIComponent(commnetsID)}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Yorum silinemedi (HTTP ${res.status}).`);
  }
  // çoğu delete boş döner; yine de JSON ise parse edelim
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

export async function getAllUsers(token, { signal } = {}) {
  if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

  const res = await fetch('https://saglikta-7d7a2dbc0cf4.herokuapp.com/user/users', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    signal
  });

  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);

  // password'u UI'ya taşımayalım
  return Array.isArray(data) ? data.map(u => ({
    userID: u.userID, name: u.name, surname: u.surname,
    dateOfBirth: u.dateOfBirth, role: u.role, email: u.email
  })) : [];
}

export async function addChat(token, { message, category }, { signal } = {}) {
const res = await fetch('https://saglikta-7d7a2dbc0cf4.herokuapp.com/chats/addChat', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${token}`
},
body: JSON.stringify({ message, category }),
signal
})

let data = null
try { data = await res.json() } catch { /* noop: bazı API'ler boş dönebilir */ }

if (!res.ok) {
const msg = (data && (data.message || data.error)) || `İstek başarısız (HTTP ${res.status})`
throw new Error(msg)
}
return data // genelde oluşturulan chat objesi ya da başarı mesajı döner
}



export { API_BASE };
