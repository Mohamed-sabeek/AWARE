import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Synchronously initialize user from localStorage to eliminate login page flash on refresh
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (token && savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (err) {
      console.error('Error parsing persisted user from localStorage:', err);
    }
    return null;
  });

  // Track initialization / verification state
  const [loading, setLoading] = useState(() => {
    // If token exists, we do a background session verification
    return !!localStorage.getItem('token');
  });

  // Verify stored session with backend on startup
  useEffect(() => {
    let isMounted = true;

    const verifyPersistedSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (isMounted && data && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.warn('Persisted session expired or invalid:', error?.response?.data?.message || error.message);
        if (isMounted) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyPersistedSession();

    // Global listener for 401 token expiration events
    const handleAuthError = () => {
      if (isMounted) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => {
      isMounted = false;
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    
    // Persist token & user profile in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Update context state
    setUser(data.user);
    setLoading(false);
    return data.user;
  }, []);

  // Explicit Logout handler: Clears all persisted authentication data
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
