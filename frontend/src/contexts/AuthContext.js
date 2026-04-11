import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSessionImagePermission, setHasSessionImagePermission] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data);
      setHasSessionImagePermission(false);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || (error.message === 'Network Error' || error.code === 'ECONNABORTED' ? 'Network Error: Cannot connect to server.' : 'Login failed');
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      setUser(data);
      setHasSessionImagePermission(false);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || (error.message === 'Network Error' || error.code === 'ECONNABORTED' ? 'Network Error: Cannot connect to server.' : 'Registration failed');
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setHasSessionImagePermission(false);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      hasSessionImagePermission, setHasSessionImagePermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};
