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
  
  // Sanitize product name to be safe for file system
  const sanitizedName = productName 
    ? productName.toLowerCase().replace(/[^a-z0-9]/g, '-') 
    : 'product';

  // Default extension
  let ext = 'jpg';
  let mimeType = 'image/jpeg';
  
  // Try to extract real extension from URI
  const parts = imageUri.split('.');
  if (parts.length > 1) {
    const detectedExt = parts.pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(detectedExt)) {
      ext = detectedExt === 'jpeg' ? 'jpg' : detectedExt;
      mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }
  }

  const fileName = `${sanitizedName}-${Date.now()}.${ext}`;
  
  // Handle Web vs Mobile uploads
  if (Platform.OS === 'web' || imageUri.startsWith('data:') || imageUri.startsWith('blob:')) {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, fileName);
    } catch (e) {
      console.error('Blob conversion failed', e);
      formData.append('image', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      });
    }
  } else {
    // React Native Mobile format
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: fileName,
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