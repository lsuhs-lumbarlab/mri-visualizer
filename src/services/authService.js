import apiClient from './apiClient';
import axios from 'axios';

const authService = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
   */
  login: async (username, password) => {
    console.log('🔐 Login attempt:', { username });
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    
    console.log('✅ Login response:', response.data);
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
   * @param {string} params.username
   * @param {string} params.password
   * @param {string} params.userType - 'hospital', 'clinician', or 'patient'
   * @returns {Promise<object>}
   */
  signup: async ({ username, password, userType }) => {
    console.log('📝 Signup attempt:', { username, userType });
    const response = await apiClient.post('/auth/register', {
      username,
      password,
      user_type: userType,
    });
    
    console.log('✅ Signup response:', response.data);
    return response.data;
  },

  /**
   * Get current authenticated user
   * Validates the stored access token and returns user data
   * @returns {Promise<object>} User object
   */
  getCurrentUser: async () => {
    console.log('👤 Fetching current user from /auth/me');
    const response = await apiClient.get('/auth/me');
    console.log('✅ Current user data:', response.data);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<{access_token: string}>}
   */
  refreshToken: async (refreshToken) => {
    console.log('🔄 Refreshing access token');
    // Create a new axios instance without interceptors to avoid infinite loops
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('✅ Token refreshed successfully');
    return response.data;
  },
};

export default authService;