// src/services/api.js
//
// SagliktanApi (Spring Boot) backend'ine ince bir fetch katmanı. Endpoint ve
// DTO şekilleri için bkz. SagliktanApi controller/dto paketleri.
//
// HATA YUTMA KONVANSİYONU (bu dosyadaki fonksiyonları çağıran her yerde):
// bir `.catch(...)` bloğu YALNIZCA şu iki durumda sessiz kalabilir, aksi
// halde en azından loglanmalı:
//   1) İkincil/arka plan verisi (bildirim sayacı, istatistik, opsiyonel bir
//      liste) - sayfanın asıl işlevini engellemez; kısa bir yorumla "neden
//      sessiz" belirtilmeli.
//   2) Beklenen/anlamsız durumlar (WS mesaj parse hatası, kullanıcının
//      kapattığı bir prompt vb.) - bunlar da yorumla açıklanmalı.
// Kullanıcının doğrudan tetiklediği bir aksiyonun (gönderme, silme,
// kaydetme) hatası HER ZAMAN showError/setError ile görünür olmalı.
const API_BASE = import.meta.env.VITE_API_BASE?.trim() || '/api';

// Dinamik import: AuthContext bu modülü de import ettiği için döngüsel
// bağımlılığı üst seviyede değil, sadece çağrı anında çözüyoruz.
async function tryRefreshAndGetToken() {
  const { attemptTokenRefresh } = await import('../context/AuthContext.jsx')
  return attemptTokenRefresh()
}

class ApiError extends Error {
  constructor(message, status, fieldErrors, retryAfterSeconds = null) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors || null;
    // 429'da backend'in Retry-After başlığı (saniye); yoksa null.
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Backend (RateLimiter) giriş/sıfırlama uçlarında 429 + Retry-After döner.
// Ham "Too Many Requests" yerine bekleme süresini de söyleyen tek bir mesaj.
export const RATE_LIMIT_MESSAGE = 'Çok fazla deneme yaptın, biraz bekleyip tekrar dene.';
function rateLimitMessage(retryAfterSeconds) {
  if (!retryAfterSeconds || retryAfterSeconds < 60) return RATE_LIMIT_MESSAGE;
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Çok fazla deneme yaptın, yaklaşık ${minutes} dakika sonra tekrar dene.`;
}

function parseRetryAfter(res) {
  const raw = res.headers?.get?.('Retry-After');
  if (!raw) return null;
  const secs = Number(raw);
  if (Number.isFinite(secs)) return Math.max(0, Math.round(secs));
  const at = Date.parse(raw);
  return Number.isNaN(at) ? null : Math.max(0, Math.round((at - Date.now()) / 1000));
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Mobil ağda "sonsuza kadar dönen" istek olmasın: her istek en fazla bu kadar
// bekler, sonra anlaşılır bir mesajla düşer.
const REQUEST_TIMEOUT_MS = 15000;
export const TIMEOUT_MESSAGE = 'Bağlantı yavaş görünüyor, tekrar dene.';

// Çağıranın isteğe bağlı AbortSignal'i ile zaman aşımını TEK bir signal'de
// birleştirir. AbortSignal.any / AbortSignal.timeout eski Safari'de yok;
// bu küçük yardımcı her tarayıcıda aynı çalışır. Dönen cleanup() istek
// bitince çağrılmalı (zamanlayıcı ve dinleyici sızmasın).
function withTimeout(signal, ms = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const forward = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', forward, { once: true });
  }
  const timer = setTimeout(() => {
    controller.abort(new DOMException('İstek zaman aşımına uğradı', 'TimeoutError'));
  }, ms);
  const cleanup = () => {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forward);
  };
  return { signal: controller.signal, cleanup };
}

// Kasıtlı iptal (bileşen unmount oldu, yeni bir istek eskisini geçersiz
// kıldı) bir hata DEĞİLDİR: çağıran taraf bunu kullanıcıya göstermemeli.
export function isAbortError(err) {
  return err?.name === 'AbortError';
}

// Backend her zaman bir `message` gövdesi dönmez (proxy/LB hatası, beklenmeyen
// 500...). Kullanıcıya ham "HTTP 500" yerine durum koduna göre anlaşılır,
// teknik jargonsuz bir yedek metin gösterilir.
function friendlyFallbackMessage(status) {
  if (status === 401 || status === 403) return 'Bu işlem için yetkin yok. Sayfayı yenileyip tekrar giriş yapmayı dene.';
  if (status === 404) return 'Aradığın şey bulunamadı.';
  if (status === 429) return 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar dene.';
  if (status >= 500) return 'Sunucuda bir sorun oluştu. Lütfen biraz sonra tekrar dene.';
  return 'İşlem tamamlanamadı. Lütfen tekrar dene.';
}

// Backend'in ErrorResponse zarfı: { status, error, message, timestamp, fieldErrors }
// fresh: true => tarayıcı HTTP önbelleğini atla (cache: 'no-store'). Backend
// bazı GET uçlarına (grup/alt grup listesi) kısa süreli "Cache-Control:
// private, max-age=60" veriyor; admin panelindeki "oluştur/sil -> listeyi
// yenile" akışı bu önbelleğe takılmasın diye oradan fresh ile çağrılır.
async function request(path, { method = 'GET', token, body, params, signal, fresh = false, _retried = false } = {}) {
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

  // fetch() HTTP yanıtı bile almadan reject edebilir (uçuş modu, kopan mobil
  // bağlantı, DNS). Tarayıcının İngilizce "Failed to fetch" metni yerine
  // anlaşılır bir mesaj verilir. AbortError kasıtlı iptaldir, aynen iletilir.
  // Zaman aşımı yalnızca bu fonksiyon içinde yaşar; çağıranın kendi signal'i
  // iptal ederse AbortError aynen iletilir (bkz. isAbortError).
  const timed = withTimeout(signal);
  let res;
  let text;
  try {
    res = await fetch(url, { method, headers, body: payload, signal: timed.signal, cache: fresh ? 'no-store' : undefined });
    // Gövde de aynı zaman aşımına tabi (başlıklar gelip gövde takılabilir).
    text = res.status === 204 ? '' : await res.text();
  } catch (err) {
    // Önce zaman aşımı: abort "reason" taşımayan eski tarayıcılar zaman
    // aşımını da düz AbortError olarak bildirir, kaynağı signal'den anlarız.
    if (err?.name === 'TimeoutError' || timed.signal.reason?.name === 'TimeoutError') {
      throw new ApiError(TIMEOUT_MESSAGE, 0, null);
    }
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('İnternet bağlantını kontrol edip tekrar dene.', 0, null);
  } finally {
    timed.cleanup();
  }

  // Access token süresi dolmuşsa (401) ve bu bir login/refresh isteği değilse,
  // bir kere refresh deneyip isteği yeni token'la tekrar et.
  if (res.status === 401 && token && !_retried && path !== '/auth/refresh' && path !== '/auth/login') {
    try {
      const newToken = await tryRefreshAndGetToken();
      if (newToken) {
        return request(path, { method, token: newToken, body, params, signal, fresh, _retried: true });
      }
    } catch {
      // refresh de başarısız oldu, aşağıda normal 401 hatası fırlatılacak
    }
  }

  // 204 No Content ya da boş gövde
  if (res.status === 204) return null;
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    // @Valid hatalarında gövdedeki genel mesaj ("Girdi doğrulama hatası")
    // yerine alan bazlı asıl sebepler (fieldErrors) gösterilir - böylece her
    // showError(err.message) çağrısı otomatik olarak anlamlı olur.
    const fieldErrors = data?.fieldErrors || null;
    const specificMessage = fieldErrors && Object.keys(fieldErrors).length
      ? Object.values(fieldErrors).join(' ')
      : null;
    if (res.status === 429) {
      const retryAfter = parseRetryAfter(res);
      throw new ApiError(rateLimitMessage(retryAfter), 429, null, retryAfter);
    }
    const message = specificMessage || (data && data.message) || friendlyFallbackMessage(res.status);
    throw new ApiError(message, res.status, fieldErrors);
  }
  return data;
}

// --- Auth ---

export function registerUser({ email, password, firstName, lastName, kvkkConsent, city }) {
  return request('/auth/register', {
    method: 'POST',
    body: { email, password, firstName, lastName, kvkkConsent, city: city || null },
  });
}

export function loginUser({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export function refreshToken(refreshTokenValue) {
  return request('/auth/refresh', { method: 'POST', body: { refreshToken: refreshTokenValue } });
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

// city: undefined => değiştirme, '' => kaldır
export function updateProfile(token, { firstName, lastName, bio, city }) {
  return request('/users/me', { method: 'PUT', token, body: { firstName, lastName, bio, city } });
}

// Deaktivasyon da artik sifre teyidi ister (backend: DELETE /users/me gövdesi
// { password } - bkz. UserController#deactivate).
export function deactivateAccount(token, password) {
  return request('/users/me', { method: 'DELETE', token, body: { password } });
}

// KVKK "veri taşınabilirliği" hakkı - kullanıcının kendi verisini JSON
// olarak indirmesi (bkz. Profile.jsx "Verilerimi İndir" satırı). Mevcut
// deactivateAccount (yukarıda, geri alınabilir) ile karıştırılmasın diye
// backend'de ayrı bir path altında (bkz. UserController#exportMyData).
export function exportMyData(token) {
  return request('/users/me/data-export', { token });
}

// Hesap silme - GERİ ALINAMAZ, şifre teyidi ister (bkz.
// UserController#deleteAccount / UserServiceImpl.deleteAccount javadoc'u).
export function deleteAccount(token, password) {
  return request('/users/me/delete-account', { method: 'POST', token, body: { password } });
}

// "Aktif Oturumlar" (Profile > Ayarlar) - hangi cihaz/tarayıcılarda oturum
// açık olduğunu listeler, current: true olan şu an kullanılan oturum (bkz.
// UserController#listSessions / JwtAuthenticationFilter sid attribute'u).
export function listSessions(token) {
  return request('/users/me/sessions', { token });
}

// id, RefreshSession.id (DB PK) - dönen listedeki "id" alanı, JWT sid DEĞİL.
export function revokeSession(token, id) {
  return request(`/users/me/sessions/${id}`, { method: 'DELETE', token });
}

// --- Profil sağlık özeti / karşılama / tercihler / benzer üyeler ---

export function updateHealthProfile(token, { communityRole, diagnosisYear, city, discoverable }) {
  return request('/users/me/health-profile', {
    method: 'PUT', token,
    body: { communityRole: communityRole || null, diagnosisYear: diagnosisYear || null, city: city || null, discoverable: !!discoverable }
  });
}

export function completeOnboarding(token) {
  return request('/users/me/onboarding/complete', { method: 'POST', token });
}

export function updatePreferences(token, { weeklyDigestEnabled }) {
  return request('/users/me/preferences', { method: 'PUT', token, body: { weeklyDigestEnabled } });
}

// Faydalılıkla açılan profil avatarları: liste (kilitliler dahil) + seçim.
export function getAvatarOptions(token) {
  return request('/users/me/avatars', { token });
}

// avatarKey null => baş harflere dön. Güncel kullanıcıyı (UserResponse) döner.
export function selectAvatar(token, avatarKey) {
  return request('/users/me/avatar', { method: 'PUT', token, body: { avatarKey } });
}

// Admin dashboard: son N günün (7-90) günlük kullanım serisi + dönem karşılaştırması.
export function getAdminActivity(token, { days = 30, signal } = {}) {
  return request('/admin/stats/activity', { token, params: { days }, signal });
}

export function getSimilarMembers(token, { limit = 8, signal } = {}) {
  return request('/users/me/similar', { token, params: { limit }, signal });
}

// Haftalık e-posta özetinin bu haftaki hâli (HTML metni döner).
export function getDigestPreview(token) {
  return request('/users/me/digest-preview', { token });
}

// Çağıranlar doğrudan değil, services/myGroups.js üzerinden (paylaşımlı
// önbellek) kullanmalı - aynı liste bir oturumda 7 ayrı ekrandan isteniyordu.
export function getMyDiseaseGroups(token, { signal } = {}) {
  return request('/users/me/disease-groups', { token, signal });
}

export function getMyPosts(token, { page = 0, size, signal } = {}) {
  return request('/users/me/posts', { token, params: { page, size }, signal });
}

// Profildeki "Kaydedilenler" sekmesi.
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

// q verilirse backend'in prefix + pg_trgm fuzzy tam metin araması devreye
// girer (bkz. DiseaseGroupController.listAll) - searchPosts/searchComments
// ile aynı arama altyapısı, DiseaseGroups.jsx'teki arama kutusu için.
export function listDiseaseGroups(token, { q, signal, fresh } = {}) {
  return request('/disease-groups', { token, params: { q }, signal, fresh });
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

export function listSubGroups(token, diseaseGroupId, { fresh } = {}) {
  return request(`/disease-groups/${diseaseGroupId}/sub-groups`, { token, fresh });
}

export function getSubGroup(token, id) {
  return request(`/sub-groups/${id}`, { token });
}

// --- Postlar ---

// sort: 'recent' (varsayılan, backend'de de varsayılan) | 'popular'
export function listPostsBySubGroup(token, subGroupId, { page = 0, size, sort, signal } = {}) {
  return request(`/sub-groups/${subGroupId}/posts`, { token, params: { page, size, sort }, signal });
}

// attachmentKeys: requestPresignedUpload + uploadToPresignedUrl ile önceden
// R2'ye yüklenmiş storage key'leri (bkz. PhotoUploadField.jsx).
// postType: 'DISCUSSION' (varsayılan) | 'QUESTION' | 'POLL'; POLL ise
// pollOptions 2-6 dolu seçenek.
export function createPost(token, subGroupId, { title, content, attachmentKeys, postType, pollOptions }) {
  const body = { title, content, attachmentKeys };
  if (postType && postType !== 'DISCUSSION') body.postType = postType;
  if (postType === 'POLL') body.pollOptions = pollOptions;
  return request(`/sub-groups/${subGroupId}/posts`, { method: 'POST', token, body });
}

// --- Soru / en iyi cevap / cevap bekleyenler ---

export function getOpenQuestions(token, { page = 0, size, signal } = {}) {
  return request('/posts/open-questions', { token, params: { page, size }, signal });
}

export function acceptAnswer(token, postId, commentId) {
  return request(`/posts/${postId}/accepted-answer`, { method: 'PUT', token, body: { commentId } });
}

export function unacceptAnswer(token, postId) {
  return request(`/posts/${postId}/accepted-answer`, { method: 'DELETE', token });
}

// --- Anket ---

export function votePoll(token, postId, optionId) {
  return request(`/posts/${postId}/poll/vote`, { method: 'PUT', token, body: { optionId } });
}

export function removePollVote(token, postId) {
  return request(`/posts/${postId}/poll/vote`, { method: 'DELETE', token });
}

// Ana sayfa akışı: kullanıcının üye olduğu tüm gruplardaki gönderiler, tek
// bir zaman sıralı akışta (bkz. Home.jsx, backend PostController.feed).
export function getMyFeed(token, { page = 0, size, sort, signal } = {}) {
  return request('/posts/feed', { token, params: { page, size, sort }, signal });
}

export function searchPosts(token, q, { page = 0, size, signal } = {}) {
  return request('/posts/search', { token, params: { q, page, size }, signal });
}

// Alt gruba özel arama (bkz. Posts.jsx) - platform geneli searchPosts'tan ayrı.
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

export function getPost(token, id, { signal } = {}) {
  return request(`/posts/${id}`, { token, signal });
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

// Profilden doğrudan kullanıcı şikayeti (sohbete girmeden de erişilebilir).
export function reportUser(token, userId, reason) {
  return request(`/users/${userId}/report`, { method: 'POST', token, body: { reason: reason || null } });
}

// --- Reaksiyonlar (beğeni yerine: Faydalı / Faydalı Değil) ---

export function reactToPost(token, postId, value) {
  return request(`/posts/${postId}/reactions`, { method: 'PUT', token, body: { value } });
}

export function removePostReaction(token, postId) {
  return request(`/posts/${postId}/reactions`, { method: 'DELETE', token });
}

// --- Kaydetme (yer imi) ---

export function savePost(token, postId) {
  return request(`/posts/${postId}/saved`, { method: 'PUT', token });
}

export function unsavePost(token, postId) {
  return request(`/posts/${postId}/saved`, { method: 'DELETE', token });
}

// --- Profile sabitlenmiş gönderi ---

export function pinPost(token, postId) {
  return request(`/posts/${postId}/pin`, { method: 'PUT', token });
}

export function unpinPost(token, postId) {
  return request(`/posts/${postId}/pin`, { method: 'DELETE', token });
}

// --- Medya (gönderi fotoğrafları) ---

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
    // Durum kodu teşhis için hatada saklanır, kullanıcıya teknik metin gösterilmez.
    throw new ApiError('Fotoğraf yüklenemedi. Lütfen tekrar dene.', res.status, null);
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

// --- Mesajlaşma - WebSocket bağlantısı için bkz.
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
