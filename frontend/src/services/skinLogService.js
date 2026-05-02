import api from './api';

const getMySkinLogs = async (token) => {
  const response = await api.get('/skinlogs', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getSkinLogById = async (id, token) => {
  const response = await api.get(`/skinlogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createSkinLog = async (logData, token) => {
  const response = await api.post('/skinlogs', logData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateSkinLog = async (id, logData, token) => {
  const response = await api.put(`/skinlogs/${id}`, logData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteSkinLog = async (id, token) => {
  const response = await api.delete(`/skinlogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const uploadSkinImage = async (imageUri) => {
  const formData = new FormData();
  
  const ext = imageUri.split('.').pop() || 'jpg';
  
  formData.append('image', {
    uri: imageUri,
    type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
    name: `skinlog-${Date.now()}.${ext}`,
  });

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const skinLogService = {
  getMySkinLogs,
  getSkinLogById,
  createSkinLog,
  updateSkinLog,
  deleteSkinLog,
  uploadSkinImage,
};

export default skinLogService;
