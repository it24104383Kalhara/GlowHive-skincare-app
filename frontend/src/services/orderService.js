import api from './api';

const createOrder = async (orderData, token) => {
  const response = await api.post('/orders', orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getMyOrders = async (token) => {
  const response = await api.get('/orders/my', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getOrderById = async (id, token) => {
  const response = await api.get(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getAllOrders = async (token) => {
  const response = await api.get('/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const cancelOrder = async (id, token) => {
  const response = await api.put(`/orders/${id}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updateOrderStatus = async (id, status, token) => {
  const response = await api.put(`/orders/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
};

export default orderService;
