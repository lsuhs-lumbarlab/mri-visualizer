import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setAuthState({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { token, user } = response;
      
      // Save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      
      // Update state
      setAuthState({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const signup = async ({ username, password, userType }) => {
    try {
      const response = await authService.signup({ username, password, userType });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Signup failed',
      };
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Reset state
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const value = {
    authState,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};