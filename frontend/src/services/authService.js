import api from './api';

const login = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

const register = async (name, email, password, role) => {
  const response = await api.post('/users', { name, email, password, role });
  return response.data;
};

const getProfile = async (token) => {
  const response = await api.get('/users/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
};

export default authService;
