import apiClient, { API_BASE_URL } from './apiClient';
import axios from 'axios';

const authService = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    const data = response.data;
    
    // Backend returns { access_token, refresh_token, user }
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user || { username: data.username },
    };
  },

  /**
   * Sign up new user
   * @param {object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} params.fullName
   * @returns {Promise<object>}
   */
  signup: async ({ email, password, fullName }) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    
    return response.data;
  },

  /**
   * Get current authenticated user
   * Validates the stored access token and returns user data
   * @returns {Promise<object>} User object
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<{access_token: string}>}
   */
  refreshToken: async (refreshToken) => {
    // Create a new axios instance without interceptors to avoid infinite loops
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },
};

export default authService;