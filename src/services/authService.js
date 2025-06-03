import api from './api';

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.surname - User's surname
   * @param {string} userData.role - User's role (doctor/patient)
   * @param {string} userData.dateOfBirth - User's date of birth (YYYY-MM-DD)
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise} - API response
   */
  signup: async (userData) => {
    try {
      const response = await api.post('/logUser/signupUser', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise} - API response with token
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/logUser/loginUser', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Get current user's token
   * @returns {string|null} - User's token or null if not logged in
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}; 