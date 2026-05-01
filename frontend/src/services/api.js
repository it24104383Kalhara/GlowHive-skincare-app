import axios from 'axios';

// FOR MOBILE TESTING: Replace 'localhost' with your computer's IP (e.g., '192.168.1.10')
// You can find your IP by running 'ipconfig' in your terminal.
export const BASE_SERVER_URL = 'http://127.0.0.1:5001'; 
const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 seconds timeout to prevent infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
