const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getAllOrders)
  .post(protect, createOrder);

router.route('/my').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;
