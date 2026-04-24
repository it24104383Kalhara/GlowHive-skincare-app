import api from './api';

const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

const getAllReviews = async () => {
  const response = await api.get('/reviews');
  return response.data;
};

const createReview = async (reviewData, token) => {
  const response = await api.post('/reviews', reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateReview = async (reviewId, reviewData, token) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const deleteReview = async (reviewId, token) => {
  const response = await api.delete(`/reviews/delete/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const reviewService = {
  getProductReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
};

export default reviewService;
