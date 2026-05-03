import { Platform } from 'react-native';
import api from './api';

const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

const createProduct = async (productData, token) => {
  const response = await api.post('/products', productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateProduct = async (id, productData, token) => {
  const response = await api.put(`/products/${id}`, productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteProduct = async (id, token) => {
  const response = await api.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const uploadImage = async (imageUri, productName = '') => {
  if (!imageUri) throw new Error('No image selected');

  const formData = new FormData();

  // Get file extension from URI (fallback to jpg)
  let ext = 'jpg';
  let mimeType = 'image/jpeg';
  if (imageUri.split('.').pop()) {
    const possibleExt = imageUri.split('.').pop().toLowerCase();
    if (possibleExt === 'png') {
      ext = 'png';
      mimeType = 'image/png';
    } else if (possibleExt === 'webp') {
      ext = 'webp';
      mimeType = 'image/webp';
    }
  }

  const cleanName = productName ? productName.replace(/[^a-z0-9]/gi, '-') : 'product';
  const fileName = `${cleanName}-${Date.now()}.${ext}`;

  if (Platform.OS === 'web') {
    // Web: Convert blob URL to File object
    let blob;
    if (imageUri.startsWith('blob:')) {
      const res = await fetch(imageUri);
      blob = await res.blob();
    } else if (imageUri.startsWith('data:')) {
      // data URL – convert to blob
      const res = await fetch(imageUri);
      blob = await res.blob();
    } else {
      // assume file URL – fallback
      const res = await fetch(imageUri);
      blob = await res.blob();
    }
    formData.append('image', blob, fileName);
  } else {
    // Native: use file object
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    });
  }

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 10000,
  });
  return response.data.filePath; // backend returns { filePath: '/uploads/...' }
};

const productService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};

export default productService;