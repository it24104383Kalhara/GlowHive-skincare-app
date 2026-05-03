import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your actual backend port (default 5000 or 5001 – check your terminal)
export const BASE_SERVER_URL = 'http://localhost:5001';
const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor to add token to all requests (except maybe login/register if you want)
api.interceptors.request.use(
  async (config) => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const { token } = JSON.parse(user);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Failed to attach token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;