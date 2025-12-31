import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import db from '../database/db';

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
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('authUser');
    
    if (access_token && userStr) {
      // Validate token with backend
      const validateToken = async () => {
        try {
          const userData = await authService.getCurrentUser();
          
          setAuthState({
            token: access_token,
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.warn('Token validation failed, clearing session:', error.message);
          // Token invalid - clear everything
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('authUser');
          setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      };
      
      validateToken();
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { access_token, refresh_token, user } = response;
      
      // Save to localStorage - use exact token names from backend
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('authUser', JSON.stringify(user));
      
      // Update state
      setAuthState({
        token: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
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

  const logout = async () => {
    try {
      // Delete IndexedDB - remove all DICOM data for privacy/security
      console.log('Deleting IndexedDB on logout...');
      
      // Close the database connection first
      db.close();
      
      // Delete the entire database
      await db.delete();
      
      // Reopen to ensure it's recreated properly
      await db.open();
      
      console.log('IndexedDB deleted successfully');
    } catch (error) {
      console.error('Error deleting IndexedDB on logout:', error);
      // Try to reopen the database even if delete fails
      try {
        await db.open();
      } catch (reopenError) {
        console.error('Error reopening database:', reopenError);
      }
    }
    
    // Clear localStorage - remove both tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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