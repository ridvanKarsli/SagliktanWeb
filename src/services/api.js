// src/services/api.js
import ChatControllerApi from './generated/src/api/ChatControllerApi'
import CommentsControllerApi from './generated/src/api/CommentsControllerApi'
import DiseaseControllerApi from './generated/src/api/DiseaseControllerApi'
import LogUserControllerApi from './generated/src/api/LogUserControllerApi'
import ReadableUserControllerApi from './generated/src/api/ReadableUserControllerApi'
import ReadableDoctorControllerApi from './generated/src/api/ReadableDoctorControllerApi'
import ReadablePublicUserControllerApi from './generated/src/api/ReadablePublicUserControllerApi'
import SpecializationControllerApi from './generated/src/api/SpecializationControllerApi'
import WorkAddressControllerApi from './generated/src/api/WorkAddressControllerApi'
import ContactInfoControllerApi from './generated/src/api/ContactInfoControllerApi'
import AnnouncementControllerApi from './generated/src/api/AnnouncementControllerApi'
import ChatReactionsControllerApi from './generated/src/api/ChatReactionsControllerApi'
import ApiClient from './generated/src/ApiClient'
import { setAuthToken } from './generated/configureClient'
import { attemptTokenRefresh } from '../context/AuthContext.jsx'

// Güvenlik için hem development hem production'da aynı-origin /api proxy kullan.
// Gerekirse VITE_API_BASE ile override edilebilir.
const isDev = import.meta.env.DEV
const API_BASE = import.meta.env.VITE_API_BASE?.trim() ||
  '/api';

const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH?.trim() || '/logUser/loginUser';
const REGISTER_PATH = import.meta.env.VITE_REGISTER_PATH?.trim() || '/logUser/signupUser';
const REFRESH_TOKEN_PATH = import.meta.env.VITE_REFRESH_TOKEN_PATH?.trim() || '/logUser/refreshToken';
const CHATS_PATH = import.meta.env.VITE_CHATS_PATH?.trim() || '/chats/getAllChat';
const POSTS_PATH = import.meta.env.VITE_POSTS_PATH?.trim() || '/post/getAllPost';
const ADD_POST_PATH = import.meta.env.VITE_ADD_POST_PATH?.trim() || '/post/addPost';
const GET_USER_POSTS_PATH = import.meta.env.VITE_GET_USER_POSTS_PATH?.trim() || '/post/getUserPosts';
const DELETE_POST_PATH = import.meta.env.VITE_DELETE_POST_PATH?.trim() || '/post/deletePost';
const GET_POSTS_WITH_FILTER_PATH = import.meta.env.VITE_GET_POSTS_WITH_FILTER_PATH?.trim() || '/post/getPostsWithFiltre';
// Yeni tek API endpoint'i
const ADD_REACTION_PATH = import.meta.env.VITE_ADD_REACTION_PATH?.trim() || '/postReaction/addReaction';
const CANCEL_REACTION_PATH = import.meta.env.VITE_CANCEL_REACTION_PATH?.trim() || '/postReaction/cancelReactionPost';
// Eski endpoint'ler (geriye dönük uyumluluk için tutuluyor, kullanılmıyor)
const LIKE_POST_PATH = import.meta.env.VITE_LIKE_POST_PATH?.trim() || '/postReaction/likePost';
const DISLIKE_POST_PATH = import.meta.env.VITE_DISLIKE_POST_PATH?.trim() || '/postReaction/dislikePost';
const CANCEL_LIKE_POST_PATH = import.meta.env.VITE_CANCEL_LIKE_POST_PATH?.trim() || '/postReaction/cancelLikePost';
const CANCEL_DISLIKE_POST_PATH = import.meta.env.VITE_CANCEL_DISLIKE_POST_PATH?.trim() || '/postReaction/cancelDislikePost';
const GET_LIKED_POST_PEOPLE_PATH = import.meta.env.VITE_GET_LIKED_POST_PEOPLE_PATH?.trim() || '/postReaction/getLikedPostPeope';
const GET_DISLIKED_POST_PEOPLE_PATH = import.meta.env.VITE_GET_DISLIKED_POST_PEOPLE_PATH?.trim() || '/postReaction/getDislikedPostPeope';

const ALLOWED_ROLES = new Set(['doctor', 'user']);

async function fetchJson(url, options = {}, { timeoutMs = 15000, retryOn401 = true } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    let data = null;
    try { data = await res.json(); } catch (_) {}
    
    // 401 hatası gelirse token refresh yap ve isteği tekrar dene
    if (res.status === 401 && retryOn401) {
      clearTimeout(id);
      try {
        // Token refresh yap
        await attemptTokenRefresh();
        // Yeni token ile header'ı güncelle
        const newHeaders = { ...options.headers };
        // Önce localStorage, sonra sessionStorage'dan token al
        let saved = localStorage.getItem('auth');
        if (!saved) {
          saved = sessionStorage.getItem('auth');
        }
        if (saved) {
          try {
            const authData = JSON.parse(saved);
            const newToken = authData.accessToken || authData.token;
            if (newToken) {
              newHeaders['Authorization'] = `Bearer ${newToken}`;
            }
          } catch {}
        }
        // İsteği yeni token ile tekrar dene (sadece 1 kez)
        return fetchJson(url, { ...options, headers: newHeaders }, { timeoutMs, retryOn401: false });
      } catch (refreshError) {
        // Refresh başarısız, hatayı fırlat
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }
    }
    
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
  // Geçici olarak Authorization header'ını kaldır
  const client = ApiClient.instance
  const prevAuth = (client?.defaultHeaders || {}).Authorization
  try {
    if (prevAuth) setAuthToken(null)
    const api = new LogUserControllerApi()
    const res = await api.login({ email, password })
    // Yeni API yapısı: accessToken ve refreshToken döndürüyor
    if (res?.accessToken) {
      return {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        message: res.message
      }
    }
    // Eski API yapısı için geriye dönük uyumluluk
    if (res?.token) {
      return {
        accessToken: res.token,
        refreshToken: res.refreshToken || null,
        message: res.message
      }
    }
    throw new Error('Sunucudan geçersiz yanıt: accessToken yok.')
  } catch (e) {
    // fallback
    const url = `${API_BASE}${LOGIN_PATH}`;
    const data = await fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    // Yeni API yapısı: accessToken ve refreshToken döndürüyor
    if (data?.accessToken) {
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        message: data.message
      }
    }
    // Eski API yapısı için geriye dönük uyumluluk
    if (data?.token) {
      return {
        accessToken: data.token,
        refreshToken: data.refreshToken || null,
        message: data.message
      }
    }
    throw new Error('Sunucudan geçersiz yanıt: accessToken yok.');
  } finally {
    // Eski header'ı geri yükle
    if (prevAuth) setAuthToken(prevAuth.replace(/^Bearer\s+/i, ''))
  }
}

export async function refreshToken(refreshTokenValue) {
  if (!refreshTokenValue) throw new Error('Refresh token zorunludur.');
  const url = `${API_BASE}${REFRESH_TOKEN_PATH}`;
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshTokenValue}`
    }
  });
  if (data?.accessToken) {
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      message: data.message
    }
  }
  throw new Error('Sunucudan geçersiz yanıt: accessToken yok.');
}

// signup: { name, surname, dateOfBirth, role: 'doctor'|'user', email, password }
export async function registerUser({ name, surname, dateOfBirth, role, email, password }) {
  if (!name || !surname || !dateOfBirth || !role || !email || !password) {
    throw new Error('Tüm alanlar zorunludur.');
  }
  const normRole = String(role).toLowerCase();
  if (!ALLOWED_ROLES.has(normRole)) throw new Error('Geçersiz rol. Sadece "doctor" veya "user" olabilir.');

  const payload = { name, surname, dateOfBirth, role: normRole, email, password };
  const client = ApiClient.instance
  const prevAuth = (client?.defaultHeaders || {}).Authorization
  try {
    if (prevAuth) setAuthToken(null)
    const api = new LogUserControllerApi()
    const res = await api.signUp(payload)
    return res
  } catch (e) {
    const url = `${API_BASE}${REGISTER_PATH}`;
    const data = await fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return data;
  } finally {
    if (prevAuth) setAuthToken(prevAuth.replace(/^Bearer\s+/i, ''))
  }
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function getAllChats(token) {
  if (!token) throw new Error('Oturum bulunamadı.');
  try {
    const api = new ChatControllerApi()
    const list = await api.getAllChat(`Bearer ${token}`)
    return Array.isArray(list) ? list : []
  } catch (e) {
    const url = `${API_BASE}${CHATS_PATH}`;
    const data = await fetchJson(url, {
      method: 'GET',
      headers: { ...authHeaders(token) }
    });
    return Array.isArray(data) ? data : [];
  }
}

/**
 * Tüm postları sayfalama ile getirir
 * @param {string} token - JWT token
 * @param {object} options - { page: number, signal?: AbortSignal }
 * @returns {Promise<{content: Array, currentPage: number, totalPages: number, totalElements: number, hasNext: boolean, hasPrevious: boolean}>}
 */
export async function getAllPosts(token, { page = 0, signal } = {}) {
  if (!token) throw new Error('Oturum bulunamadı.');
  const url = `${API_BASE}${POSTS_PATH}?page=${page}`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) },
    signal
  });
  // PageResponse yapısını kontrol et
  if (data && typeof data === 'object' && Array.isArray(data.content)) {
    return data;
  }
  // Eski format veya direkt array dönerse (geriye uyumluluk)
  return {
    content: Array.isArray(data) ? data : [],
    currentPage: page,
    totalPages: 1,
    totalElements: Array.isArray(data) ? data.length : 0,
    hasNext: false,
    hasPrevious: page > 0
  };
}

export async function getPostWithId(token, postID) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!postID) throw new Error('Post ID gerekli.');
  const url = `${API_BASE}/post/getPostWithId?postID=${encodeURIComponent(postID)}`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  });
  return data;
}

export async function getUserProfile(token) {
  if (!token) throw new Error('Oturum bulunamadı.');
  try {
    const api = new ReadableUserControllerApi()
    return await api.getLoggedPerson(`Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/user/loggedUser`;
    const data = await fetchJson(url, {
      method: 'GET',
      headers: { ...authHeaders(token) }
    });
    return data;
  }
}

export async function getDoctorProfile(token, userID) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!userID) throw new Error('Kullanıcı ID gerekli.');
  try {
    const api = new ReadableDoctorControllerApi()
    return await api.getDoctor(userID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/doctor/doctor?userID=${userID}`;
    const data = await fetchJson(url, {
      method: 'GET',
      headers: { ...authHeaders(token) }
    });
    return data;
  }
}

// 👇 USER rolü için public profil (token'lı)
export async function getPublicUserProfile(token, userID) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!userID) throw new Error('Kullanıcı ID gerekli.');
  try {
    const api = new ReadablePublicUserControllerApi()
    return await api.getPublicUser(userID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/publicUser/publicUser?userID=${userID}`;
    const data = await fetchJson(url, {
      method: 'GET',
      headers: { ...authHeaders(token) }
    });
    return data;
  }
}

/**
 * Belirli bir kullanıcının postlarını sayfalama ile getirir
 * @param {string} token - JWT token
 * @param {number|string} userID - Kullanıcı ID
 * @param {object} options - { page: number, signal?: AbortSignal }
 * @returns {Promise<{content: Array, currentPage: number, totalPages: number, totalElements: number, hasNext: boolean, hasPrevious: boolean}>}
 */
export async function getChatsByUserID(token, userID, { page = 0, signal } = {}) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!userID) throw new Error('Kullanıcı ID gerekli.');
  const url = `${API_BASE}${GET_USER_POSTS_PATH}?userID=${encodeURIComponent(userID)}&page=${page}`;
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) },
    signal
  });
  // PageResponse yapısını kontrol et
  if (data && typeof data === 'object' && Array.isArray(data.content)) {
    return data;
  }
  // Eski format veya direkt array dönerse (geriye uyumluluk)
  return {
    content: Array.isArray(data) ? data : [],
    currentPage: page,
    totalPages: 1,
    totalElements: Array.isArray(data) ? data.length : 0,
    hasNext: false,
    hasPrevious: page > 0
  };
}

// --- Disease APIs ---

/**
 * Hastalık isimlerini döner: ["Astım", "Diyabet", ...]
 */
export async function getDiseaseNames(token, { signal } = {}) {
  try {
    const api = new DiseaseControllerApi()
    const data = await api.getDiseaseNames(`Bearer ${token}`)
    const list = Array.isArray(data) ? data : []
    const uniq = Array.from(new Set(list));
    uniq.sort((a, b) => a.localeCompare(b, 'tr'));
    return uniq;
  } catch (e) {
    const url = `${API_BASE}/disease/getDiseaseNames`;
    const data = await fetchJson(url, {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal
    });
    const list = Array.isArray(data) ? data : [];
    const uniq = Array.from(new Set(list));
    uniq.sort((a, b) => a.localeCompare(b, 'tr'));
    return uniq;
  }
}

/**
 * Yeni hastalık ekler: { name, dateOfDiagnosis }
 */
export async function addDisease(token, payload) {
  try {
    const api = new DiseaseControllerApi()
    return await api.addDisease(`Bearer ${token}`, payload)
  } catch (e) {
    const url = `${API_BASE}/disease/addDisease`;
    return fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload)
    });
  }
}

export async function deleteDisease(token, diseaseID) {
  if (!diseaseID) throw new Error('diseaseID gerekli.');
  try {
    const api = new DiseaseControllerApi()
    return await api.deleteDisease(diseaseID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/disease/deleteDisease?diseaseID=${encodeURIComponent(diseaseID)}`;
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) } });
  }
}

// --- Doctor: Specialization Add ---
export async function addSpecialization(token, payload, { signal } = {}) {
  // payload: { nameOfSpecialization: string, specializationExperience: number }
  try {
    const api = new SpecializationControllerApi()
    return await api.addSpecialization(`Bearer ${token}`, payload)
  } catch (e) {
    const url = `${API_BASE}/specialization/addSpecialization`;
    return fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    });
  }
}

// --- Doctor: Specialization Delete ---
export async function deleteSpecialization(token, specializationID, { signal } = {}) {
  if (!specializationID) throw new Error('specializationID gerekli.')
  try {
    const api = new SpecializationControllerApi()
    return await api.deleteSpecialization(specializationID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/specialization/deleteSpecialization?specializationID=${encodeURIComponent(specializationID)}`
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) }, signal })
  }
}

// --- Doctor: Work Address Add ---
export async function addWorkAddress(token, payload, { signal } = {}) {
  // payload: { workPlaceName, street, city, county, country }
  try {
    const api = new WorkAddressControllerApi()
    return await api.addWorkAddress(`Bearer ${token}`, payload)
  } catch (e) {
    const url = `${API_BASE}/workAddress/addWorkAddress`;
    return fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
  }
}

// --- Doctor: Work Address Delete ---
export async function deleteWorkAddress(token, addressID, { signal } = {}) {
  if (!addressID) throw new Error('addressID gerekli.')
  try {
    const api = new WorkAddressControllerApi()
    return await api.deleteWorkAddress(addressID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/workAddress/deleteWorkAddress?addressID=${encodeURIComponent(addressID)}`
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) }, signal })
  }
}

// --- Doctor: Contact Add ---
export async function addContactInfor(token, payload, { signal } = {}) {
  // payload: { email: string, phoneNumber: string }
  try {
    const api = new ContactInfoControllerApi()
    return await api.addContactInfo(`Bearer ${token}`, payload)
  } catch (e) {
    const url = `${API_BASE}/contactInfor/addContactInfor`;
    return fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
  }
}

// --- Doctor: Contact Delete ---
export async function deleteContact(token, contactID, { signal } = {}) {
  if (!contactID) throw new Error('contactID gerekli.')
  try {
    const api = new ContactInfoControllerApi()
    return await api.deleteContact(contactID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/contactInfor/deleteContact?contactID=${encodeURIComponent(contactID)}`
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) }, signal })
  }
}

// --- Doctor: Announcement Add ---
export async function addAnnouncement(token, payload, { signal } = {}) {
  // payload: { title, content, uploadDate: "YYYY-MM-DD" }
  try {
    const api = new AnnouncementControllerApi()
    return await api.addAnnouncement(`Bearer ${token}`, payload)
  } catch (e) {
    const url = `${API_BASE}/announcement/addAnnouncement`;
    return fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
  }
}

// --- Doctor: Announcement Delete ---
export async function deleteAnnouncement(token, announcementID, { signal } = {}) {
  if (!announcementID) throw new Error('announcementID gerekli.')
  try {
    const api = new AnnouncementControllerApi()
    return await api.deleteAnnouncement(announcementID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/announcement/deleteAnnouncement?announcementID=${encodeURIComponent(announcementID)}`
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) }, signal })
  }
}

export async function deleteChat(token, postID) {
  // Yeni API: post silme endpoint'i kullanıyor
  if (!token) throw new Error('Token gerekli');
  if (!postID) throw new Error('postID gerekli');
  
  const url = `${API_BASE}${DELETE_POST_PATH}?postID=${encodeURIComponent(postID)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Silme başarısız (HTTP ${res.status})`);
  }
  try { return await res.json(); } catch { return true; }
}

// Yeni unified post/comment ekleme fonksiyonu
export async function addPost(token, { parentsID, message, category, uploadDate }, { signal } = {}) {
  if (!message) throw new Error('Mesaj zorunludur.');
  if (parentsID === undefined || parentsID === null) throw new Error('parentsID zorunludur.');
  
  // uploadDate yoksa bugünün tarihini kullan (YYYY-MM-DD formatında)
  const dateStr = uploadDate || new Date().toISOString().split('T')[0]
  
  // parentsID'yi number'a çevir
  const parentsIDNum = Number(parentsID)
  if (!Number.isFinite(parentsIDNum)) {
    throw new Error(`Geçersiz parentsID: ${parentsID}`)
  }
  
  const payload = {
    parentsID: parentsIDNum,
    message: message.trim(),
    uploadDate: dateStr
  }
  
  // Category varsa ekle (hem ana post hem yorum için)
  if (category) {
    payload.category = category
  }
  
  const url = `${API_BASE}${ADD_POST_PATH}`;
  
  // Debug: payload'ı console'a yazdır
  try {
    console.debug('[addPost] Request payload:', JSON.stringify(payload, null, 2))
  } catch {}
  
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
    signal
  })
}

export async function addComment(token, postID, message, category, userID) {
  // Yeni API: addPost kullanarak yorum ekle (parentsID = yorum yapılan postun ID'si)
  if (!message || !message.trim()) {
    throw new Error('Yorum metni zorunludur.')
  }
  
  // postID number olarak gelmeli (Posts.jsx ve Profile.jsx'ten zaten temizlenmiş olarak geliyor)
  // Ama yine de string olarak gelebilir, güvenli bir şekilde number'a çevir
  let parentsID
  if (typeof postID === 'number') {
    parentsID = postID
  } else if (typeof postID === 'string') {
    // String ise temizle ve number'a çevir
    const cleanPostID = postID.replace(/^p_/, '').replace(/^c_/, '').trim()
    parentsID = Number(cleanPostID)
  } else {
    parentsID = Number(postID)
  }
  
  if (!Number.isFinite(parentsID) || parentsID <= 0) {
    throw new Error(`Geçersiz post ID: ${postID} (number: ${parentsID})`)
  }
  
  // Debug log
  try {
    console.debug('[addComment] Adding comment:', { postID, parentsID, category, messageLength: message.length })
  } catch {}
  
  return addPost(token, { parentsID, message, category })
}



export async function deleteComment(token, commnetsID) {
  // DİKKAT: endpoint param adı "commnetsID" (yazım bu şekilde)
  try {
    const api = new CommentsControllerApi()
    return await api.deleteComment(commnetsID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/comments/deleteComment?commnetsID=${encodeURIComponent(commnetsID)}`
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) } })
  }
}

/* --- Reactions (Post) --- */
// Yeni tek API: Hem like hem dislike için, hem de iptal için kullanılıyor
export async function addPostReaction(token, postID, isLike) {
  // Yeni API: post reaction endpoint'i (like/dislike/iptal için tek endpoint)
  // isLike: true = like, false = dislike
  // Aynı reaksiyonu tekrar göndermek iptal ediyor
  if (!token) throw new Error('Token gerekli')
  if (!postID) throw new Error('postID gerekli')
  if (typeof isLike !== 'boolean') throw new Error('isLike boolean olmalı')
  
  const url = `${API_BASE}${ADD_REACTION_PATH}?postID=${encodeURIComponent(postID)}&isLike=${isLike}`
  return fetchJson(url, {
    method: 'POST',
    headers: { ...authHeaders(token) }
  })
}

// Eski fonksiyonlar (geriye dönük uyumluluk için - yeni API'yi kullanıyor)
export async function likeChatReaction(token, postID) {
  return addPostReaction(token, postID, true)
}

export async function dislikeChatReaction(token, postID) {
  return addPostReaction(token, postID, false)
}

// İptal işlemleri için yeni ayrı endpoint
export async function cancelPostReaction(token, postReactionID) {
  // Yeni API: reaction iptal endpoint'i (DELETE metodu)
  if (!token) throw new Error('Token gerekli')
  if (!postReactionID) throw new Error('postReactionID gerekli')
  
  const url = `${API_BASE}${CANCEL_REACTION_PATH}?postReactionID=${encodeURIComponent(postReactionID)}`
  return fetchJson(url, {
    method: 'DELETE',
    headers: { ...authHeaders(token) }
  })
}

// Eski fonksiyonlar (geriye dönük uyumluluk için - yeni API'yi kullanıyor)
export async function cancelLikeChatReaction(token, postID, userID, postReactionID = null) {
  // İptal için: postReactionID gerekli
  if (!postReactionID) {
    throw new Error('İptal edilecek like reaction ID bulunamadı. postReactionID gerekli.')
  }
  return cancelPostReaction(token, postReactionID)
}

export async function cancelDislikeChatReaction(token, postID, userID, postReactionID = null) {
  // İptal için: postReactionID gerekli
  if (!postReactionID) {
    throw new Error('İptal edilecek dislike reaction ID bulunamadı. postReactionID gerekli.')
  }
  return cancelPostReaction(token, postReactionID)
}

/* --- Post Reaction People --- */
export async function getLikedPostPeople(token, postID) {
  // Yeni API: post beğenen kişileri çekme endpoint'i
  if (!token) throw new Error('Token gerekli')
  if (!postID) throw new Error('postID gerekli')
  const url = `${API_BASE}${GET_LIKED_POST_PEOPLE_PATH}?postID=${encodeURIComponent(postID)}`
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  })
  return Array.isArray(data) ? data : []
}

export async function getDislikedPostPeople(token, postID) {
  // Yeni API: post beğenmeyen kişileri çekme endpoint'i
  if (!token) throw new Error('Token gerekli')
  if (!postID) throw new Error('postID gerekli')
  const url = `${API_BASE}${GET_DISLIKED_POST_PEOPLE_PATH}?postID=${encodeURIComponent(postID)}`
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  })
  return Array.isArray(data) ? data : []
}

/* --- Reactions (Comment) --- */
// Yorumlar da post olarak geçtiği için post reaction API'lerini kullanıyoruz
export async function likeCommentReaction(token, commentID) {
  // Post reaction API kullanarak yorum beğenme
  if (!token) throw new Error('Token gerekli')
  if (!commentID) throw new Error('commentID gerekli')
  const url = `${API_BASE}${LIKE_POST_PATH}?postID=${encodeURIComponent(commentID)}`
  return fetchJson(url, {
    method: 'POST',
    headers: { ...authHeaders(token) }
  })
}

export async function dislikeCommentReaction(token, commentID) {
  // Post reaction API kullanarak yorum beğenmeme
  if (!token) throw new Error('Token gerekli')
  if (!commentID) throw new Error('commentID gerekli')
  const url = `${API_BASE}${DISLIKE_POST_PATH}?postID=${encodeURIComponent(commentID)}`
  return fetchJson(url, {
    method: 'POST',
    headers: { ...authHeaders(token) }
  })
}

export async function cancelLikeCommentReaction(token, commentIDOrReactionID, userID = null, postReactionID = null) {
  // Post reaction API kullanarak yorum beğenmeyi iptal etme
  // Geriye uyumluluk: Eğer sadece 2 parametre verilirse (token, reactionID), direkt reactionID kullan
  // Yeni kullanım: (token, commentID, userID, postReactionID)
  if (!token) throw new Error('Token gerekli')
  if (!commentIDOrReactionID) throw new Error('commentID veya reactionID gerekli')
  
  let reactionId = postReactionID || null
  
  // Eğer sadece 2 parametre verilmişse (eski kullanım), ikinci parametre direkt reactionID'dir
  if (arguments.length === 2) {
    reactionId = commentIDOrReactionID
  } else if (!reactionId && userID && commentIDOrReactionID) {
    // Yeni yöntem: liked people listesinden bul (fallback)
    try {
      const people = await getLikedCommentPeople(token, commentIDOrReactionID)
      const mine = Array.isArray(people) ? people.find(p => (p?.userID === Number(userID))) : null
      reactionId = mine?.chatReactionsID ?? mine?.postReactionID ?? mine?.reactionID ?? mine?.id
    } catch (e) {
      // Fallback başarısız olursa hata fırlat
    }
  }
  
  if (!reactionId) {
    throw new Error('İptal edilecek like kaydı bulunamadı. postReactionID gerekli.')
  }
  
  const url = `${API_BASE}${CANCEL_LIKE_POST_PATH}?postReactionID=${encodeURIComponent(reactionId)}`
  return fetchJson(url, {
    method: 'DELETE',
    headers: { ...authHeaders(token) }
  })
}

export async function cancelDislikeCommentReaction(token, commentIDOrReactionID, userID = null, postReactionID = null) {
  // Post reaction API kullanarak yorum beğenmemeyi iptal etme
  // Geriye uyumluluk: Eğer sadece 2 parametre verilirse (token, reactionID), direkt reactionID kullan
  // Yeni kullanım: (token, commentID, userID, postReactionID)
  if (!token) throw new Error('Token gerekli')
  if (!commentIDOrReactionID) throw new Error('commentID veya reactionID gerekli')
  
  let reactionId = postReactionID || null
  
  // Eğer sadece 2 parametre verilmişse (eski kullanım), ikinci parametre direkt reactionID'dir
  if (arguments.length === 2) {
    reactionId = commentIDOrReactionID
  } else if (!reactionId && userID && commentIDOrReactionID) {
    // Yeni yöntem: disliked people listesinden bul (fallback)
    try {
      const people = await getDislikedCommentPeople(token, commentIDOrReactionID)
      const mine = Array.isArray(people) ? people.find(p => (p?.userID === Number(userID))) : null
      reactionId = mine?.chatReactionsID ?? mine?.postReactionID ?? mine?.reactionID ?? mine?.id
    } catch (e) {
      // Fallback başarısız olursa hata fırlat
    }
  }
  
  if (!reactionId) {
    throw new Error('İptal edilecek dislike kaydı bulunamadı. postReactionID gerekli.')
  }
  
  const url = `${API_BASE}${CANCEL_DISLIKE_POST_PATH}?postReactionID=${encodeURIComponent(reactionId)}`
  return fetchJson(url, {
    method: 'DELETE',
    headers: { ...authHeaders(token) }
  })
}

// YARDIMCI: Comment için beğenen/beğenmeyen kullanıcı listelerini çek (reactionID bulmak için)
export async function getLikedCommentPeople(token, commentID) {
  // Post reaction API kullanarak yorum beğenen kişileri çekme
  if (!token) throw new Error('Token gerekli')
  if (!commentID) throw new Error('commentID gerekli')
  const url = `${API_BASE}${GET_LIKED_POST_PEOPLE_PATH}?postID=${encodeURIComponent(commentID)}`
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  })
  return Array.isArray(data) ? data : []
}

export async function getDislikedCommentPeople(token, commentID) {
  // Post reaction API kullanarak yorum beğenmeyen kişileri çekme
  if (!token) throw new Error('Token gerekli')
  if (!commentID) throw new Error('commentID gerekli')
  const url = `${API_BASE}${GET_DISLIKED_POST_PEOPLE_PATH}?postID=${encodeURIComponent(commentID)}`
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) }
  })
  return Array.isArray(data) ? data : []
}

/**
 * Tüm kullanıcıları sayfalama ile getirir
 * @param {string} token - JWT token
 * @param {object} options - { page: number, signal?: AbortSignal, fetchAll?: boolean }
 * @returns {Promise<{content: Array, currentPage: number, totalPages: number, totalElements: number, hasNext: boolean, hasPrevious: boolean} | Array>}
 */
export async function getAllUsers(token, { page = 0, signal, fetchAll = false } = {}) {
  if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  
  const mapUser = (u) => ({
    userID: u.userID, name: u.name, surname: u.surname,
    dateOfBirth: u.dateOfBirth, role: u.role, email: u.email
  });
  
  try {
    const api = new ReadableUserControllerApi()
    const data = await api.getAllPerson(`Bearer ${token}`)
    const content = Array.isArray(data) ? data.map(mapUser)
      : (data?.content ? data.content.map(mapUser) : []);
    
    if (fetchAll) return content;
    
    return {
      content,
      currentPage: data?.currentPage || 0,
      totalPages: data?.totalPages || 1,
      totalElements: data?.totalElements || content.length,
      hasNext: data?.hasNext || false,
      hasPrevious: data?.hasPrevious || false
    };
  } catch (e) {
    const url = `${API_BASE}/user/users?page=${page}`;
    const data = await fetchJson(url, { method: 'GET', headers: { ...authHeaders(token), 'Accept': 'application/json' }, signal });
    
    // PageResponse yapısını kontrol et
    if (data && typeof data === 'object' && Array.isArray(data.content)) {
      const content = data.content.map(mapUser);
      
      // fetchAll true ise tüm sayfaları çek
      if (fetchAll && data.hasNext) {
        let allContent = [...content];
        let currentPage = data.currentPage;
        while (data.hasNext || currentPage < data.totalPages - 1) {
          currentPage++;
          const nextUrl = `${API_BASE}/user/users?page=${currentPage}`;
          const nextData = await fetchJson(nextUrl, { method: 'GET', headers: { ...authHeaders(token), 'Accept': 'application/json' }, signal });
          if (nextData?.content) {
            allContent = [...allContent, ...nextData.content.map(mapUser)];
          }
          if (!nextData?.hasNext) break;
        }
        return allContent;
      }
      
      if (fetchAll) return content;
      
      return {
        content,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      };
    }
    
    // Eski format
    const content = Array.isArray(data) ? data.map(mapUser) : [];
    if (fetchAll) return content;
    return {
      content,
      currentPage: page,
      totalPages: 1,
      totalElements: content.length,
      hasNext: false,
      hasPrevious: page > 0
    };
  }
}

/**
 * Tüm doktorları sayfalama ile getirir
 * @param {string} token - JWT token
 * @param {object} options - { page: number, signal?: AbortSignal, fetchAll?: boolean }
 * @returns {Promise<{content: Array, currentPage: number, totalPages: number, totalElements: number, hasNext: boolean, hasPrevious: boolean} | Array>}
 */
export async function getAllDoctors(token, { page = 0, signal, fetchAll = false } = {}) {
  if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  
  const mapDoctor = (d) => ({
    userID: d.userID, name: d.name, surname: d.surname,
    dateOfBirth: d.dateOfBirth, role: 'doctor', email: d.email,
    specialization: d.specialization || [],
    worksAddress: d.worksAddress || [],
    contactInfor: d.contactInfor || []
  });
  
  try {
    const api = new ReadableDoctorControllerApi()
    const data = await api.getAllDoctor(`Bearer ${token}`)
    const content = Array.isArray(data) ? data.map(mapDoctor) 
      : (data?.content ? data.content.map(mapDoctor) : []);
    
    if (fetchAll) return content;
    
    return {
      content,
      currentPage: data?.currentPage || 0,
      totalPages: data?.totalPages || 1,
      totalElements: data?.totalElements || content.length,
      hasNext: data?.hasNext || false,
      hasPrevious: data?.hasPrevious || false
    };
  } catch (e) {
    const url = `${API_BASE}/doctor/doctors?page=${page}`;
    const data = await fetchJson(url, { method: 'GET', headers: { ...authHeaders(token), 'Accept': 'application/json' }, signal });
    
    // PageResponse yapısını kontrol et
    if (data && typeof data === 'object' && Array.isArray(data.content)) {
      const content = data.content.map(mapDoctor);
      
      // fetchAll true ise tüm sayfaları çek
      if (fetchAll && data.hasNext) {
        let allContent = [...content];
        let currentPage = data.currentPage;
        while (data.hasNext || currentPage < data.totalPages - 1) {
          currentPage++;
          const nextUrl = `${API_BASE}/doctor/doctors?page=${currentPage}`;
          const nextData = await fetchJson(nextUrl, { method: 'GET', headers: { ...authHeaders(token), 'Accept': 'application/json' }, signal });
          if (nextData?.content) {
            allContent = [...allContent, ...nextData.content.map(mapDoctor)];
          }
          if (!nextData?.hasNext) break;
        }
        return allContent;
      }
      
      if (fetchAll) return content;
      
      return {
        content,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      };
    }
    
    // Eski format
    const content = Array.isArray(data) ? data.map(mapDoctor) : [];
    if (fetchAll) return content;
    return {
      content,
      currentPage: page,
      totalPages: 1,
      totalElements: content.length,
      hasNext: false,
      hasPrevious: page > 0
    };
  }
}

/**
 * Tüm public kullanıcıları sayfalama ile getirir
 * @param {string} token - JWT token
 * @param {object} options - { page: number, signal?: AbortSignal, fetchAll?: boolean }
 * @returns {Promise<{content: Array, currentPage: number, totalPages: number, totalElements: number, hasNext: boolean, hasPrevious: boolean} | Array>}
 */
export async function getAllPublicUsers(token, { page = 0, signal, fetchAll = false } = {}) {
  if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  
  const mapUser = (u) => ({
    userID: u.userID, name: u.name, surname: u.surname,
    dateOfBirth: u.dateOfBirth, role: 'user', email: u.email,
    diseases: u.diseases || []
  });
  
  try {
    const api = new ReadablePublicUserControllerApi()
    const data = await api.getAllPublicUser(`Bearer ${token}`)
    const content = Array.isArray(data) ? data.map(mapUser)
      : (data?.content ? data.content.map(mapUser) : []);
    
    if (fetchAll) return content;
    
    return {
      content,
      currentPage: data?.currentPage || 0,
      totalPages: data?.totalPages || 1,
      totalElements: data?.totalElements || content.length,
      hasNext: data?.hasNext || false,
      hasPrevious: data?.hasPrevious || false
    };
  } catch (e) {
    const url = `${API_BASE}/publicUser/publicUsers?page=${page}`;
    const data = await fetchJson(url, { method: 'GET', headers: { ...authHeaders(token), 'Accept': 'application/json' }, signal });
    
    // PageResponse yapısını kontrol et
    if (data && typeof data === 'object' && Array.isArray(data.content)) {
      const content = data.content.map(mapUser);
      
      // fetchAll true ise tüm sayfaları çek
      if (fetchAll && data.hasNext) {
        let allContent = [...content];
        let currentPage = data.currentPage;
        while (data.hasNext || currentPage < data.totalPages - 1) {
          currentPage++;
          const nextUrl = `${API_BASE}/publicUser/publicUsers?page=${currentPage}`;
          const nextData = await fetchJson(nextUrl, { method: 'GET', headers: { ...authHeaders(token), 'Accept': 'application/json' }, signal });
          if (nextData?.content) {
            allContent = [...allContent, ...nextData.content.map(mapUser)];
          }
          if (!nextData?.hasNext) break;
        }
        return allContent;
      }
      
      if (fetchAll) return content;
      
      return {
        content,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      };
    }
    
    // Eski format
    const content = Array.isArray(data) ? data.map(mapUser) : [];
    if (fetchAll) return content;
    return {
      content,
      currentPage: page,
      totalPages: 1,
      totalElements: content.length,
      hasNext: false,
      hasPrevious: page > 0
    };
  }
}

export async function addChat(token, { message, category }, { signal } = {}) {
  // Yeni API: addPost kullanarak ana post ekle (parentsID = 0)
  return addPost(token, { parentsID: 0, message, category }, { signal })
}

/**
 * Kategoriye göre postları sayfalama ile getirir
 * @param {string} token - JWT token
 * @param {string} category - Kategori adı
 * @param {object} options - { page: number, signal?: AbortSignal }
 * @returns {Promise<{content: Array, currentPage: number, totalPages: number, totalElements: number, hasNext: boolean, hasPrevious: boolean}>}
 */
export async function getChatsWithFilter(token, category, { page = 0, signal } = {}) {
  if (!token) throw new Error('Oturum bulunamadı.')
  if (!category) return getAllPosts(token, { page, signal })
  
  const url = `${API_BASE}${GET_POSTS_WITH_FILTER_PATH}?category=${encodeURIComponent(category)}&page=${page}`
  const data = await fetchJson(url, {
    method: 'GET',
    headers: { ...authHeaders(token) },
    signal
  })
  // PageResponse yapısını kontrol et
  if (data && typeof data === 'object' && Array.isArray(data.content)) {
    return data;
  }
  // Eski format veya direkt array dönerse (geriye uyumluluk)
  return {
    content: Array.isArray(data) ? data : [],
    currentPage: page,
    totalPages: 1,
    totalElements: Array.isArray(data) ? data.length : 0,
    hasNext: false,
    hasPrevious: page > 0
  };
}

// Ziyaretçi profili görüntüleme için: userID'den temel kişi bilgisi
export async function getUserByID(token, userID) {
  if (!token) throw new Error('Oturum bulunamadı.')
  if (!userID) throw new Error('Kullanıcı ID gerekli.')
  try {
    const api = new ReadableUserControllerApi()
    return await api.getPerson(Number(userID), `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/user/getUser?userID=${encodeURIComponent(userID)}`
    return fetchJson(url, { method: 'GET', headers: { ...authHeaders(token) } })
  }
}



export { API_BASE };
