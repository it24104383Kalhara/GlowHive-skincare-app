const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReview).get(getAllReviews);
router.get('/product/:productId', getProductReviews);
router.delete('/delete/:id', protect, deleteReview);
router.put('/:id', protect, updateReview);

module.exports = router;
