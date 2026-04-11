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

const uploadImage = async (imageUri) => {
  const formData = new FormData();
  // React Native requires this exact format for files
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `product-${Date.now()}.jpg`,
  });

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
  uploadImage,
};

export default productService;
