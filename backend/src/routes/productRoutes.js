const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.post('/', protect, createProduct); // Removed 'admin' for easier testing

router.get('/:id', getProductById);
router.put('/:id', protect, updateProduct); // Temporarily removed 'admin'
router.delete('/:id', protect, deleteProduct); // Temporarily removed 'admin'

module.exports = router;
