import apiClient from './apiClient';

const authService = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{token: string, user: object}>}
   */
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    
    // Be flexible with response structure
    // Backend might return { token, user } or { access_token, user } etc.
    const data = response.data;
    return {
      token: data.token || data.access_token || data.accessToken,
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
    const response = await apiClient.post('/auth/signup', {
      username,
      password,
      userType,
    });
    
    return response.data;
  },
};

export default authService;