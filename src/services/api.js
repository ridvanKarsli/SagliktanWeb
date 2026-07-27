// src/services/api.js
//
// SagliktanApi (Spring Boot) backend'ine ince bir fetch katmanı.
// Eski (com.saglikAdimiAPI) backend'e özgü generated OpenAPI client'ı ve
// doktor/uzmanlık/iş adresi/duyuru/reaksiyon gibi karşılığı olmayan
// fonksiyonlar kaldırıldı. Backend'in gerçek endpoint/DTO şekli:
// bkz. SagliktanApi controller/dto paketleri.

const API_BASE = import.meta.env.VITE_API_BASE?.trim() || '/api';

// Dinamik import: AuthContext bu modülü de import ettiği için döngüsel
// bağımlılığı üst seviyede değil, sadece çağrı anında çözüyoruz.
async function tryRefreshAndGetToken() {
  const { attemptTokenRefresh } = await import('../context/AuthContext.jsx')
  return attemptTokenRefresh()
}

class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors || null;
  }
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Backend'in ErrorResponse zarfı: { status, error, message, timestamp, fieldErrors }
async function request(path, { method = 'GET', token, body, params, signal, _retried = false } = {}) {
  let url = `${API_BASE}${path}`;
  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    }
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }

  const headers = { ...authHeaders(token) };
  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: payload, signal });

  // Access token süresi dolmuşsa (401) ve bu bir login/refresh isteği değilse,
  // bir kere refresh deneyip isteği yeni token'la tekrar et.
  if (res.status === 401 && token && !_retried && path !== '/auth/refresh' && path !== '/auth/login') {
    try {
      const newToken = await tryRefreshAndGetToken();
      if (newToken) {
        return request(path, { method, token: newToken, body, params, signal, _retried: true });
      }
    } catch {
      // refresh de başarısız oldu, aşağıda normal 401 hatası fırlatılacak
    }
  }

  // 204 No Content ya da boş gövde
  if (res.status === 204) return null;
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const message = (data && data.message) || `İstek başarısız (HTTP ${res.status})`;
    throw new ApiError(message, res.status, data?.fieldErrors);
  }
  return data;
}

// --- Auth ---

export function registerUser({ email, password, firstName, lastName, kvkkConsent }) {
  return request('/auth/register', {
    method: 'POST',
    body: { email, password, firstName, lastName, kvkkConsent },
  });
}

export function loginUser({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export function refreshToken(refreshTokenValue) {
  return request('/auth/refresh', { method: 'POST', body: { refreshToken: refreshTokenValue } });
}

export function verifyEmail({ email, code }) {
  return request('/auth/verify-email', { method: 'POST', body: { email, code } });
}

export function forgotPassword({ email }) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword({ email, code, newPassword }) {
  return request('/auth/reset-password', { method: 'POST', body: { email, code, newPassword } });
}

export function changePassword(token, { currentPassword, newPassword }) {
  return request('/auth/change-password', { method: 'POST', token, body: { currentPassword, newPassword } });
}

export function logoutUser(token) {
  return request('/auth/logout', { method: 'POST', token });
}

// --- Kullanıcı (kendi profilim) ---

export function getUserProfile(token) {
  return request('/users/me', { token });
}

export function updateProfile(token, { firstName, lastName, bio }) {
  return request('/users/me', { method: 'PUT', token, body: { firstName, lastName, bio } });
}

export function deactivateAccount(token) {
  return request('/users/me', { method: 'DELETE', token });
}

export function getMyDiseaseGroups(token) {
  return request('/users/me/disease-groups', { token });
}

export function getMyPosts(token, { page = 0, size, signal } = {}) {
  return request('/users/me/posts', { token, params: { page, size }, signal });
}

// --- Hastalık grupları ---

export function listDiseaseGroups(token, { signal } = {}) {
  return request('/disease-groups', { token, signal });
}

export function getDiseaseGroup(token, id) {
  return request(`/disease-groups/${id}`, { token });
}

export function listDiseaseGroupMembers(token, id) {
  return request(`/disease-groups/${id}/members`, { token });
}

export function joinDiseaseGroup(token, id) {
  return request(`/disease-groups/${id}/join`, { method: 'POST', token });
}

export function leaveDiseaseGroup(token, id) {
  return request(`/disease-groups/${id}/leave`, { method: 'DELETE', token });
}

// --- Alt gruplar ---

export function listSubGroups(token, diseaseGroupId) {
  return request(`/disease-groups/${diseaseGroupId}/sub-groups`, { token });
}

export function getSubGroup(token, id) {
  return request(`/sub-groups/${id}`, { token });
}

// --- Postlar ---

export function listPostsBySubGroup(token, subGroupId, { page = 0, size, signal } = {}) {
  return request(`/sub-groups/${subGroupId}/posts`, { token, params: { page, size }, signal });
}

export function createPost(token, subGroupId, { title, content }) {
  return request(`/sub-groups/${subGroupId}/posts`, { method: 'POST', token, body: { title, content } });
}

export function searchPosts(token, q, { page = 0, size, signal } = {}) {
  return request('/posts/search', { token, params: { q, page, size }, signal });
}

export function getPost(token, id) {
  return request(`/posts/${id}`, { token });
}

export function updatePost(token, id, { title, content }) {
  return request(`/posts/${id}`, { method: 'PUT', token, body: { title, content } });
}

export function deletePost(token, id) {
  return request(`/posts/${id}`, { method: 'DELETE', token });
}

// --- Yorumlar ---

export function listComments(token, postId, { page = 0, size, signal } = {}) {
  return request(`/posts/${postId}/comments`, { token, params: { page, size }, signal });
}

export function createComment(token, postId, content, parentCommentId) {
  return request(`/posts/${postId}/comments`, {
    method: 'POST',
    token,
    body: { content, parentCommentId: parentCommentId ?? null },
  });
}

export function updateComment(token, id, content) {
  return request(`/comments/${id}`, { method: 'PUT', token, body: { content } });
}

export function deleteComment(token, id) {
  return request(`/comments/${id}`, { method: 'DELETE', token });
}

// --- Şikayet ---

export function reportPost(token, postId, reason) {
  return request(`/posts/${postId}/report`, { method: 'POST', token, body: { reason: reason || null } });
}

export function reportComment(token, commentId, reason) {
  return request(`/comments/${commentId}/report`, { method: 'POST', token, body: { reason: reason || null } });
}

export { ApiError, API_BASE };
