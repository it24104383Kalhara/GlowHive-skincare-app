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
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateProduct = async (id, productData, token) => {
  const response = await api.put(`/products/${id}`, productData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const deleteProduct = async (id, token) => {
  const response = await api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const uploadImage = async (imageUri, productName = '') => {
  const formData = new FormData();
  
  // Sanitize product name to be safe for file system
  const sanitizedName = productName 
    ? productName.toLowerCase().replace(/[^a-z0-9]/g, '-') 
    : 'product';

  // Default extension
  let ext = 'jpg';
  
  // Try to extract real extension from URI if not a blob/data URL
  if (!imageUri.startsWith('data:') && !imageUri.startsWith('blob:')) {
    const parts = imageUri.split('.');
    if (parts.length > 1) {
      const detectedExt = parts.pop().toLowerCase();
      if (['jpg', 'jpeg', 'png'].includes(detectedExt)) {
        ext = detectedExt === 'jpeg' ? 'jpg' : detectedExt;
      }
    }
  }

  const fileName = `${sanitizedName}-${Date.now()}.${ext}`;
  
  // Handle Web vs Mobile uploads
  if (Platform.OS === 'web' || imageUri.startsWith('data:') || imageUri.startsWith('blob:')) {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Better extension from blob type if possible
      let finalFileName = fileName;
      if (blob.type) {
        const typeExt = blob.type.split('/')[1];
        if (typeExt === 'png' || typeExt === 'jpeg' || typeExt === 'jpg') {
          const actualExt = typeExt === 'jpeg' ? 'jpg' : typeExt;
          finalFileName = `${sanitizedName}-${Date.now()}.${actualExt}`;
        }
      }
      
      formData.append('image', blob, finalFileName);
    } catch (e) {
      console.error('Blob conversion failed', e);
      // Fallback to standard object if fetch fails
      formData.append('image', {
        uri: imageUri,
        type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        name: fileName,
      });
    }
  } else {
    // React Native Mobile format
    formData.append('image', {
      uri: imageUri,
      type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
      name: fileName,
    });
  }

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
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
