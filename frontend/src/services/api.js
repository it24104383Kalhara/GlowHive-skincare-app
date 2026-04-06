import axios from 'axios';

// IMPORTANT: For Android Emulator, use 10.0.2.2. For iOS, use localhost. 
// For physical devices, use your computer's IP address.
const API_URL = 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
