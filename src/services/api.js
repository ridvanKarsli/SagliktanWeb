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
import CommentReactionsControllerApi from './generated/src/api/CommentReactionsControllerApi'
import ApiClient from './generated/src/ApiClient'
import { setAuthToken } from './generated/configureClient'
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
  // Geçici olarak Authorization header'ını kaldır
  const client = ApiClient.instance
  const prevAuth = (client?.defaultHeaders || {}).Authorization
  try {
    if (prevAuth) setAuthToken(null)
    const api = new LogUserControllerApi()
    const res = await api.login({ email, password })
    if (!res?.token) throw new Error('Sunucudan geçersiz yanıt: token yok.')
    return res
  } catch (e) {
    // fallback
    const url = `${API_BASE}${LOGIN_PATH}`;
    const data = await fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!data?.token) throw new Error('Sunucudan geçersiz yanıt: token yok.');
    return data;
  } finally {
    // Eski header'ı geri yükle
    if (prevAuth) setAuthToken(prevAuth.replace(/^Bearer\s+/i, ''))
  }
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

// 👇 Belirli bir userID'nin gönderileri (token'lı)
export async function getChatsByUserID(token, userID) {
  if (!token) throw new Error('Oturum bulunamadı.');
  if (!userID) throw new Error('Kullanıcı ID gerekli.');
  try {
    const api = new ChatControllerApi()
    const list = await api.getChats(userID, `Bearer ${token}`)
    return Array.isArray(list) ? list : []
  } catch (e) {
    const url = `${API_BASE}/chats/getChats?userID=${userID}`;
    const data = await fetchJson(url, {
      method: 'GET',
      headers: { ...authHeaders(token) }
    });
    return Array.isArray(data) ? data : [];
  }
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

export async function deleteChat(token, chatID) {
  if (!token) throw new Error('Token gerekli');
  if (!chatID) throw new Error('chatID gerekli');
  try {
    const api = new ChatControllerApi()
    return await api.deleteChat(chatID, `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/chats/deleteChat?chatID=${encodeURIComponent(chatID)}`;
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
}

export async function addComment(token, chatID, message, userID) {
  const payload = userID != null ? { message, chatID, userID } : { message, chatID }
  try {
    const api = new CommentsControllerApi()
    return await api.addComment(`Bearer ${token}`, payload)
  } catch (e) {
    const url = `${API_BASE}/comments/addComment`;
    return fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload)
    })
  }
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

/* --- Reactions (Chat) --- */
export async function likeChatReaction(token, chatID) {
  const api = new ChatReactionsControllerApi()
  return api.likeChat(Number(chatID), `Bearer ${token}`)
}
export async function dislikeChatReaction(token, chatID) {
  const api = new ChatReactionsControllerApi()
  return api.dislikeChat(Number(chatID), `Bearer ${token}`)
}
export async function cancelLikeChatReaction(token, chatID, userID) {
  const api = new ChatReactionsControllerApi()
  // cancel requires chatReactionsID → fetch liked people and pick my reaction
  const people = await api.getLikedChatPeope(Number(chatID), `Bearer ${token}`)
  const mine = Array.isArray(people) ? people.find(p => (p?.userID === Number(userID))) : null
  const reactionId = mine?.chatReactionsID ?? mine?.reactionID ?? mine?.id
  if (!reactionId) throw new Error('İptal edilecek like kaydı bulunamadı.')
  return api.cancelLikeChat(Number(reactionId), `Bearer ${token}`)
}
export async function cancelDislikeChatReaction(token, chatID, userID) {
  const api = new ChatReactionsControllerApi()
  const people = await api.getDislikedChatPeope(Number(chatID), `Bearer ${token}`)
  const mine = Array.isArray(people) ? people.find(p => (p?.userID === Number(userID))) : null
  const reactionId = mine?.chatReactionsID ?? mine?.reactionID ?? mine?.id
  if (!reactionId) throw new Error('İptal edilecek dislike kaydı bulunamadı.')
  return api.cancelDislikeChat(Number(reactionId), `Bearer ${token}`)
}

/* --- Reactions (Comment) --- */
export async function likeCommentReaction(token, commentID) {
  const api = new CommentReactionsControllerApi()
  return api.likeComment(Number(commentID), `Bearer ${token}`)
}
export async function dislikeCommentReaction(token, commentID) {
  const api = new CommentReactionsControllerApi()
  return api.dislikeComment(Number(commentID), `Bearer ${token}`)
}
export async function cancelLikeCommentReaction(token, commentID) {
  // DİKKAT: Bu fonksiyon reaction ID (chatReactionsID) bekler
  try {
    const api = new CommentReactionsControllerApi()
    return await api.cancelLikeComment(Number(commentID), `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/CommentReactions/cancelLikeComment?cancelcommmentsLikeID=${encodeURIComponent(commentID)}`
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) } })
  }
}
export async function cancelDislikeCommentReaction(token, commentID) {
  // DİKKAT: Bu fonksiyon reaction ID (chatReactionsID) bekler
  try {
    const api = new CommentReactionsControllerApi()
    return await api.cancelDislikeComment(Number(commentID), `Bearer ${token}`)
  } catch (e) {
    const url = `${API_BASE}/CommentReactions/cancelDislikeComment?cancelcommmentsDislikeID=${encodeURIComponent(commentID)}`
    return fetchJson(url, { method: 'DELETE', headers: { ...authHeaders(token) } })
  }
}

// YARDIMCI: Comment için beğenen/beğenmeyen kullanıcı listelerini çek (reactionID bulmak için)
export async function getLikedCommentPeople(token, commentID) {
  try {
    const api = new CommentReactionsControllerApi()
    const list = await api.getLikedCommentPeope(Number(commentID), `Bearer ${token}`)
    return Array.isArray(list) ? list : []
  } catch (e) {
    // Fallback denemeleri: farklı param ve path varyasyonları
    const variants = [
      `${API_BASE}/CommentReactions/getLikedCommentPeope?commentID=${encodeURIComponent(commentID)}`,
      `${API_BASE}/CommentReactions/getLikedCommentPeope?commnetsID=${encodeURIComponent(commentID)}`,
      `${API_BASE}/commentReactions/getLikedCommentPeope?commentID=${encodeURIComponent(commentID)}`,
      `${API_BASE}/commentReactions/getLikedCommentPeope?commnetsID=${encodeURIComponent(commentID)}`,
    ]
    for (const url of variants) {
      try {
        // debug
        // eslint-disable-next-line no-console
        console.debug('[API] getLikedCommentPeople try', url)
        const data = await fetchJson(url, { method: 'GET', headers: { ...authHeaders(token) } })
        if (Array.isArray(data) && data.length >= 0) return data
      } catch {
        // try next
      }
    }
    return []
  }
}

export async function getDislikedCommentPeople(token, commentID) {
  try {
    const api = new CommentReactionsControllerApi()
    const list = await api.getDislikedCommentPeope(Number(commentID), `Bearer ${token}`)
    return Array.isArray(list) ? list : []
  } catch (e) {
    const variants = [
      `${API_BASE}/CommentReactions/getDislikedCommentPeope?commentID=${encodeURIComponent(commentID)}`,
      `${API_BASE}/CommentReactions/getDislikedCommentPeope?commnetsID=${encodeURIComponent(commentID)}`,
      `${API_BASE}/commentReactions/getDislikedCommentPeope?commentID=${encodeURIComponent(commentID)}`,
      `${API_BASE}/commentReactions/getDislikedCommentPeope?commnetsID=${encodeURIComponent(commentID)}`,
    ]
    for (const url of variants) {
      try {
        // eslint-disable-next-line no-console
        console.debug('[API] getDislikedCommentPeople try', url)
        const data = await fetchJson(url, { method: 'GET', headers: { ...authHeaders(token) } })
        if (Array.isArray(data) && data.length >= 0) return data
      } catch {
        // try next
      }
    }
    return []
  }
}

export async function getAllUsers(token, { signal } = {}) {
  if (!token) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
  try {
    const api = new ReadableUserControllerApi()
    const data = await api.getAllPerson(`Bearer ${token}`)
    return Array.isArray(data) ? data.map(u => ({
      userID: u.userID, name: u.name, surname: u.surname,
      dateOfBirth: u.dateOfBirth, role: u.role, email: u.email
    })) : []
  } catch (e) {
    const url = `${API_BASE}/user/users`;
    const data = await fetchJson(url, { method: 'GET', headers: { ...authHeaders(token), 'Accept': 'application/json' }, signal });
  return Array.isArray(data) ? data.map(u => ({
    userID: u.userID, name: u.name, surname: u.surname,
    dateOfBirth: u.dateOfBirth, role: u.role, email: u.email
  })) : [];
  }
}

export async function addChat(token, { message, category }, { signal } = {}) {
  try {
    const api = new ChatControllerApi()
    return await api.addChat(`Bearer ${token}`, { message, category })
  } catch (e) {
    const url = `${API_BASE}/chats/addChat`;
    return fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ message, category }),
      signal
    })
  }
}

export async function getChatsWithFilter(token, category) {
  if (!token) throw new Error('Oturum bulunamadı.')
  if (!category) return getAllChats(token)
  try {
    const api = new ChatControllerApi()
    const list = await api.getChatsWithFiltre(String(category), `Bearer ${token}`)
    return Array.isArray(list) ? list : []
  } catch (e) {
    const url = `${API_BASE}/chats/getChatsWithFiltre?category=${encodeURIComponent(category)}`
    const data = await fetchJson(url, { method: 'GET', headers: { ...authHeaders(token) } })
    return Array.isArray(data) ? data : []
  }
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
