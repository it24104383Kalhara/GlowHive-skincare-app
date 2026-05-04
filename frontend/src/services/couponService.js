import api from './api';

const couponService = {
  getCoupons: async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get('/coupons', config);
    return response.data;
  },

  getCouponById: async (id, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get(`/coupons/${id}`, config);
    return response.data;
  },

  createCoupon: async (couponData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.post('/coupons', couponData, config);
    return response.data;
  },

  updateCoupon: async (id, couponData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.put(`/coupons/${id}`, couponData, config);
    return response.data;
  },

  deleteCoupon: async (id, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.delete(`/coupons/${id}`, config);
    return response.data;
  },

  validateCoupon: async (code, subtotal, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.post('/coupons/validate', { code, subtotal }, config);
    return response.data;
  },
};

export default couponService;
