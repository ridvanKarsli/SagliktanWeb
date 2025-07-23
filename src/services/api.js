import axios from 'axios';

const API_BASE_URL = 'https://api.sagliktan.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Tüm gönderileri getirir
 * @returns {Promise<Array>} Gönderi listesi
 */
export const getAllChats = async () => {
  const response = await api.get('/chats/getAllChat');
  return response.data;
};

/**
 * Giriş yapmış kullanıcının profilini getirir
 * @returns {Promise<Object>} Kullanıcı profili
 */
export const getLoggedUser = async () => {
  const response = await api.get('/user/loggedUser');
  return response.data;
};

/**
 * Doktor detaylarını userID ile getirir
 * @param {number} userID
 * @returns {Promise<Object>} Doktor detayları
 */
export const getDoctorDetails = async (userID) => {
  const response = await api.get(`/doctor/doctor?userID=${userID}`);
  return response.data;
};

/**
 * Tüm kullanıcıları getirir
 * @returns {Promise<Array>} Kullanıcı listesi
 */
export const getAllUsers = async () => {
  const response = await api.get('/user/users');
  return response.data;
};

/**
 * Belirli bir kullanıcıyı userID ile getirir
 * @param {number} userID
 * @returns {Promise<Object>} Kullanıcı
 */
export const getUserById = async (userID) => {
  const response = await api.get(`/user/user?userID=${userID}`);
  return response.data;
};

/**
 * Belirli bir public user'ı userID ile getirir
 * @param {number} userID
 * @returns {Promise<Object>} Public user
 */
export const getPublicUserById = async (userID) => {
  const response = await api.get(`/publicUser/publicUser?userID=${userID}`);
  return response.data;
};

export default api; 