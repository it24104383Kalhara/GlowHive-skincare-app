const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    price,
    stock,
    ingredients,
    skinTypeTags,
    imageUrl,
    category,
  } = req.body;

  const product = new Product({
    title,
    price,
    stock,
    ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map(i => i.trim()) : []),
    skinTypeTags,
    imageUrl,
    category: category || 'NONE',
    user: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    title,
    price,
    stock,
    ingredients,
    skinTypeTags,
    imageUrl,
    category,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.title = title || product.title;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.ingredients = ingredients ? (Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim())) : product.ingredients;
    product.skinTypeTags = skinTypeTags || product.skinTypeTags;
    product.imageUrl = imageUrl || product.imageUrl;
    product.category = category || product.category;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
};
