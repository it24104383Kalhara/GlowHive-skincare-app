import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// FOR MOBILE TESTING: Replace 'localhost' with your computer's IP (e.g., '192.168.1.10')
export const BASE_SERVER_URL = 'http://127.0.0.1:5001'; 

const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
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