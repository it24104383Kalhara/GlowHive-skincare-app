import axios from 'axios';

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

export default api;
