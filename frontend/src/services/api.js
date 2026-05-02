import axios from 'axios';

// For Expo Go on physical device, use your local IP: 192.168.1.15
export const BASE_SERVER_URL = 'https://lazy-hounds-beg.loca.lt';
const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout for unstable connections
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

export default api;
