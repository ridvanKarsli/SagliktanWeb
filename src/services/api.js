// src/services/api.js
//
// SagliktanApi (Spring Boot) backend'ine ince bir fetch katmanı.
// Eski (com.saglikAdimiAPI) backend'e özgü generated OpenAPI client'ı ve
// doktor/uzmanlık/iş adresi/duyuru/reaksiyon gibi karşılığı olmayan
// fonksiyonlar kaldırıldı. Backend'in gerçek endpoint/DTO şekli:
// bkz. SagliktanApi controller/dto paketleri.
//
// HATA YUTMA KONVANSİYONU (bu dosyadaki fonksiyonları çağıran her yerde
// geçerli): bir `.catch(...)` bloğu YALNIZCA aşağıdaki iki durumdan birinde
// sessiz kalmalı - aksi halde en azından `console.warn`/`console.error` ile
// logla (bkz. ReactionButtons.jsx'teki örnek: sessizce yutulan bir hata,
// arayüz eski haline dönse bile NEDEN başarısız olduğunu hiçbir yerde
// görünmez kılıyor, teşhisi imkansızlaştırıyor):
//   1) İkincil/arka plan verisi (bildirim sayacı, dashboard istatistiği,
//      "opsiyonel" bir liste gibi) - sayfanın asıl işlevini engellemiyor,
//      kullanıcıya toast ile rahatsız etmeye değmez. Yine de KISA bir
//      yorumla "neden sessiz" belirtilmeli (bkz. Profile.jsx satır ~177).
//   2) Zaten beklenen/anlamsız durumlar (WS mesaj parse hatası, kullanıcının
//      kendi kapattığı bir prompt vb.) - bunlar da yorumla açıklanmalı.
// Kullanıcının doğrudan tetiklediği bir aksiyonun (form gönderme, silme,
// kaydetme vb.) hatası HER ZAMAN showError/setError ile görünür olmalı.
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

// Faz 2 adım 3: profildeki "Kaydedilenler" sekmesi.
export function getMySavedPosts(token, { page = 0, size, signal } = {}) {
  return request('/users/me/saved-posts', { token, params: { page, size }, signal });
}

// --- Başka bir kullanıcının herkese açık profili ---

export function getUserPublicProfile(token, id) {
  return request(`/users/${id}`, { token });
}

export function getUserPosts(token, id, { page = 0, size, signal } = {}) {
  return request(`/users/${id}/posts`, { token, params: { page, size }, signal });
}

// --- Hastalık grupları ---

export function listDiseaseGroups(token, { signal } = {}) {
  return request('/disease-groups', { token, signal });
}

export function getDiseaseGroup(token, id) {
  return request(`/disease-groups/${id}`, { token });
}

export function listDiseaseGroupMembers(token, id, { page = 0, size, signal } = {}) {
  return request(`/disease-groups/${id}/members`, { token, params: { page, size }, signal });
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

// sort: 'recent' (varsayılan, backend'de de varsayılan) | 'popular'
export function listPostsBySubGroup(token, subGroupId, { page = 0, size, sort, signal } = {}) {
  return request(`/sub-groups/${subGroupId}/posts`, { token, params: { page, size, sort }, signal });
}

// attachmentKeys: Faz 2 adım 4 - requestPresignedUpload + uploadToPresignedUrl
// ile önceden R2'ye yüklenmiş storage key'leri (bkz. PhotoUploadField.jsx).
export function createPost(token, subGroupId, { title, content, attachmentKeys }) {
  return request(`/sub-groups/${subGroupId}/posts`, {
    method: 'POST', token, body: { title, content, attachmentKeys }
  });
}

export function searchPosts(token, q, { page = 0, size, signal } = {}) {
  return request('/posts/search', { token, params: { q, page, size }, signal });
}

// Faz 2 adım 2: "Gönderiler" sayfasındaki alt gruba özel arama - searchPosts
// (platform geneli) ile karıştırılmasın diye ayrı fonksiyon.
export function searchPostsInSubGroup(token, subGroupId, q, { page = 0, size, signal } = {}) {
  return request(`/sub-groups/${subGroupId}/posts/search`, { token, params: { q, page, size }, signal });
}

export function searchComments(token, q, { page = 0, size, signal } = {}) {
  return request('/comments/search', { token, params: { q, page, size }, signal });
}

export function searchUsers(token, q, { page = 0, size, signal } = {}) {
  return request('/users/search', { token, params: { q, page, size }, signal });
}

// Twitter tarzı birleşik "hızlı arama": tek istekte post/yorum/kişiden en
// alakalı ilk birkaçını bir arada döner - yazarken öneri (dropdown) için.
export function quickSearch(token, q, { signal } = {}) {
  return request('/search', { token, params: { q }, signal });
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

// Bir yorumun DOĞRUDAN yanıtlarını sayfalı getirir (thread-drill: kullanıcı
// bir yorumun "N yanıtı görüntüle" butonuna tıklayınca çağrılır). Backend
// artık tüm yorum ağacını tek seferde göndermiyor - bkz. CommentController.
export function listCommentReplies(token, commentId, { page = 0, size, signal } = {}) {
  return request(`/comments/${commentId}/replies`, { token, params: { page, size }, signal });
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

// --- Reaksiyonlar (beğeni yerine: Faydalı / Faydalı Değil) ---

export function reactToPost(token, postId, value) {
  return request(`/posts/${postId}/reactions`, { method: 'PUT', token, body: { value } });
}

export function removePostReaction(token, postId) {
  return request(`/posts/${postId}/reactions`, { method: 'DELETE', token });
}

// --- Kaydetme (yıldızlama) - Faz 2 adım 3 ---

export function savePost(token, postId) {
  return request(`/posts/${postId}/saved`, { method: 'PUT', token });
}

export function unsavePost(token, postId) {
  return request(`/posts/${postId}/saved`, { method: 'DELETE', token });
}

// --- Medya (gönderi fotoğrafları) - Faz 2 adım 4 ---

export function requestPresignedUpload(token, contentType) {
  return request('/media/presigned-upload-url', { method: 'POST', token, body: { contentType } });
}

// R2'ye DOĞRUDAN yükleme - bilerek request()'i kullanmıyor: hedef backend
// değil R2'nin kendisi (imzalı URL zaten kimlik doğrulamayı taşıyor,
// Authorization header'ına gerek yok) ve gövde JSON değil ham dosya
// baytları (bkz. PhotoUploadField.jsx).
export async function uploadToPresignedUrl(uploadUrl, file, contentType) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file
  });
  if (!res.ok) {
    throw new Error(`Fotoğraf yüklenemedi (${res.status})`);
  }
}

export function reactToComment(token, commentId, value) {
  return request(`/comments/${commentId}/reactions`, { method: 'PUT', token, body: { value } });
}

export function removeCommentReaction(token, commentId) {
  return request(`/comments/${commentId}/reactions`, { method: 'DELETE', token });
}

// --- Bildirimler (WebSocket bağlantısı için bkz. services/notificationSocket.js) ---

export function listNotifications(token, { page = 0, size, signal } = {}) {
  return request('/notifications', { token, params: { page, size }, signal });
}

export function getUnreadNotificationCount(token, { signal } = {}) {
  return request('/notifications/unread-count', { token, signal });
}

export function markNotificationRead(token, id) {
  return request(`/notifications/${id}/read`, { method: 'PUT', token });
}

export function markAllNotificationsRead(token) {
  return request('/notifications/read-all', { method: 'PUT', token });
}

// --- Mesajlaşma (Faz 2 adım 6) - WebSocket bağlantısı için bkz.
// services/messagingSocket.js. Mesaj isteği kabul edilmeden serbest
// mesajlaşma açılmıyor, bkz. backend MessageRequestService.

export function sendMessageRequest(token, recipientId) {
  return request('/messages/requests', { method: 'POST', token, body: { recipientId } });
}

export function listMessageRequests(token, { page = 0, size, signal } = {}) {
  return request('/messages/requests', { token, params: { page, size }, signal });
}

export function getPendingMessageRequestCount(token, { signal } = {}) {
  return request('/messages/requests/count', { token, signal });
}

export function acceptMessageRequest(token, id) {
  return request(`/messages/requests/${id}/accept`, { method: 'PUT', token });
}

export function rejectMessageRequest(token, id) {
  return request(`/messages/requests/${id}/reject`, { method: 'PUT', token });
}

export function listSentMessageRequests(token, { page = 0, size, signal } = {}) {
  return request('/messages/requests/outgoing', { token, params: { page, size }, signal });
}

export function cancelMessageRequest(token, id) {
  return request(`/messages/requests/${id}`, { method: 'DELETE', token });
}

export function listConversations(token, { page = 0, size, signal } = {}) {
  return request('/messages/conversations', { token, params: { page, size }, signal });
}

// Sohbet ekranına doğrudan girildiğinde (liste sayfasından geçmeden) karşı
// tarafın kim olduğunu göstermek için - bkz. Chat.jsx.
export function getConversation(token, conversationId, { signal } = {}) {
  return request(`/messages/conversations/${conversationId}`, { token, signal });
}

export function listConversationMessages(token, conversationId, { page = 0, size, signal } = {}) {
  return request(`/messages/conversations/${conversationId}/messages`, { token, params: { page, size }, signal });
}

export function sendChatMessage(token, conversationId, { content, attachmentKey, sharedPostId }) {
  return request(`/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    token,
    body: { content: content || null, attachmentKey: attachmentKey || null, sharedPostId: sharedPostId || null }
  });
}

export function markConversationRead(token, conversationId) {
  return request(`/messages/conversations/${conversationId}/read`, { method: 'PUT', token });
}

export function getUnreadMessageCount(token, { signal } = {}) {
  return request('/messages/unread-count', { token, signal });
}

export function reportMessage(token, messageId, reason) {
  return request(`/messages/${messageId}/report`, { method: 'POST', token, body: { reason: reason || null } });
}

export function blockUser(token, userId) {
  return request(`/messages/block/${userId}`, { method: 'POST', token });
}

export function unblockUser(token, userId) {
  return request(`/messages/block/${userId}`, { method: 'DELETE', token });
}

export function listBlockedUsers(token, { signal } = {}) {
  return request('/messages/blocked', { token, signal });
}

// --- Admin paneli ---

export function getAdminStats(token) {
  return request('/admin/stats', { token });
}

export function listAdminUsers(token, { q, active, role, page = 0, size, signal } = {}) {
  return request('/admin/users', { token, params: { q, active, role, page, size }, signal });
}

export function updateAdminUser(token, id, { firstName, lastName, bio, role, active }) {
  return request(`/admin/users/${id}`, { method: 'PUT', token, body: { firstName, lastName, bio, role, active } });
}

export function listAdminReports(token, { status, page = 0, size, signal } = {}) {
  return request('/admin/reports', { token, params: { status, page, size }, signal });
}

export function resolveAdminReport(token, id, status, deleteContent = false) {
  return request(`/admin/reports/${id}`, { method: 'PUT', token, body: { status, deleteContent } });
}

// Genel içerik moderasyonu: sadece şikayet edilenler değil tüm postlar/yorumlar.
// hasPhotos=true: tehlikeli/uygunsuz görsel içerik denetimi için sadece
// fotoğraflı gönderileri getirir (bkz. AdminPanel.jsx ContentTab).
export function listAdminPosts(token, { q, hasPhotos, page = 0, size, signal } = {}) {
  return request('/admin/posts', { token, params: { q, hasPhotos, page, size }, signal });
}

export function listAdminComments(token, { q, page = 0, size, signal } = {}) {
  return request('/admin/comments', { token, params: { q, page, size }, signal });
}

// --- Hastalık grupları / alt gruplar (admin yönetimi) ---

export function createDiseaseGroup(token, { name, description }) {
  return request('/disease-groups', { method: 'POST', token, body: { name, description: description || null } });
}

export function updateDiseaseGroup(token, id, { name, description }) {
  return request(`/disease-groups/${id}`, { method: 'PUT', token, body: { name, description: description || null } });
}

export function deleteDiseaseGroup(token, id) {
  return request(`/disease-groups/${id}`, { method: 'DELETE', token });
}

export function createSubGroup(token, diseaseGroupId, { name, description }) {
  return request(`/disease-groups/${diseaseGroupId}/sub-groups`, {
    method: 'POST', token, body: { name, description: description || null }
  });
}

export function updateSubGroup(token, id, { name, description }) {
  return request(`/sub-groups/${id}`, { method: 'PUT', token, body: { name, description: description || null } });
}

export function deleteSubGroup(token, id) {
  return request(`/sub-groups/${id}`, { method: 'DELETE', token });
}

export { ApiError, API_BASE };
