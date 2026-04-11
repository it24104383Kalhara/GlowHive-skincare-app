import axios from 'axios';

// For Expo Go on physical device, use your local IP: 192.168.129.36
const API_URL = 'http://192.168.250.36:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 seconds timeout to prevent infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
