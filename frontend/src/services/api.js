import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  // Web browser — localhost always works
  if (Platform.OS === 'web') {
    return 'http://localhost:5001';
  }

  // If running on an Android Emulator, 10.0.2.2 is the special alias to your laptop's localhost
  if (Platform.OS === 'android' && !Constants.isDevice) {
    console.log('📱 Android Emulator detected. Using 10.0.2.2 alias');
    return 'http://10.0.2.2:5001';
  }

  // Native (physical device)
  // expo-constants gives us the host machine's IP via the Expo dev server
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    const url = `http://${ip}:5001`;
    console.log('🌐 API Base URL (auto-detected):', url);
    return url;
  }

  // Last-resort fallback
  const fallback = 'http://192.168.82.168:5001';
  console.warn('⚠️  Could not auto-detect IP. Using fallback:', fallback);
  return fallback;
};

export const BASE_SERVER_URL = getBaseUrl();
const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

import { Alert } from 'react-native';

// Attach JWT token to every request automatically
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

// Global response handler for timeouts and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      Alert.alert(
        'Connection Timeout',
        'The Botanical Archive server is taking too long to respond. Please check your connection and try again.'
      );
    } else if (error.message === 'Network Error') {
       Alert.alert(
        'Network Error',
        'Unable to reach the GlowHive servers. Please ensure your backend is running.'
      );
    }
    return Promise.reject(error);
  }
);

export default api;