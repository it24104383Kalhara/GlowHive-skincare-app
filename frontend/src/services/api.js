import axios from 'axios';

// For Expo Go on physical device, use your local IP: 192.168.250.36
export const BASE_SERVER_URL = 'http://192.168.15.36:5000';
const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 seconds timeout to prevent infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
