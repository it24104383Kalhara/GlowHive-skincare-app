import axios from 'axios';

// For Expo Go on physical device, use your local IP: 192.168.1.5
export const BASE_SERVER_URL = 'http://192.168.1.5:5000';
const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout to allow image uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
