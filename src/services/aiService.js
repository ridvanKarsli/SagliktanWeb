import api from './api';

export const aiService = {
  /**
   * Send message to AI and get response
   * @param {string} message - User's message
   * @returns {Promise} - API response with AI message
   */
  askAI: async (message) => {
    try {
      const response = await api.post(`/sagliktaAI/ask?message=${encodeURIComponent(message)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 