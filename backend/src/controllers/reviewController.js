const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, beforeImage, afterImage, productId } = req.body;

  // 1. Basic ID Validation
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(404);
    throw new Error('Product not found (Invalid ID)');
  }

  // 2. Field Presence Validation
  if (!rating) {
    res.status(400);
    throw new Error('Please provide a rating');
  }
  if (!comment || comment.trim().length === 0) {
    res.status(400);
    throw new Error('Please fill the comment section');
  }
  if (!beforeImage || !afterImage) {
    res.status(400);
    throw new Error('upload photoes after and before');
  }

  // 3. Data Range/Type Validation
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }
  if (comment.length < 3) {
    res.status(400);
    throw new Error('Comment must be at least 3 characters long');
  }
  if (comment.length > 500) {
    res.status(400);
    throw new Error('Comment must not exceed 500 characters');
  }

  const product = await Product.findById(productId);

  if (product) {
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already archived results for this product');
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      name: req.user.name,
      rating: Number(rating),
      comment,
      beforeImage,
      afterImage,
    });

    // Update product average rating and number of reviews
    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json(review);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
    return res.json([]); // Return empty array for mock/invalid products to prevent 500 error
  }

  const reviews = await Review.find({ product: req.params.productId }).sort({
    createdAt: -1,
  });

  if (reviews) {
    res.json(reviews);
  } else {
    res.status(404);
    throw new Error('Reviews not found');
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment, beforeImage, afterImage } = req.body;

  const review = await Review.findById(req.params.id);

  if (review) {
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this review');
    }

    // Validation for updates
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Rating must be between 1 and 5');
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      if (comment.trim().length < 3) {
        res.status(400);
        throw new Error('Comment must be at least 3 characters long');
      }
      if (comment.length > 500) {
        res.status(400);
        throw new Error('Comment must not exceed 500 characters');
      }
      review.comment = comment;
    }

    review.beforeImage = beforeImage || review.beforeImage;
    review.afterImage = afterImage || review.afterImage;

    const updatedReview = await review.save();

    // Update product average rating
    const reviews = await Review.find({ product: review.product });
    const product = await Product.findById(review.product);
    if (product) {
      product.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      await product.save();
    }

    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/delete/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  console.log(`[DELETE REVIEW] Initiated for ID: ${req.params.id}`);
  console.log(`[DELETE REVIEW] User attempting delete: ${req.user._id} (Admin: ${req.user.isAdmin})`);

  const review = await Review.findById(req.params.id);

  if (review) {
    console.log(`[DELETE REVIEW] Review found. Owner: ${review.user}`);
    // Check if it's the owner or an admin
    if (
      String(review.user) !== String(req.user._id) &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error('Not authorized to delete this review');
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Update product stats
    const product = await Product.findById(productId);
    if (product) {
      const reviews = await Review.find({ product: productId });
      product.numReviews = reviews.length;
      product.rating = reviews.length > 0
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0;
      await product.save();
    }

    res.json({ message: 'Review successfully removed from the archive.' });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Get all reviews (Global feed)
// @route   GET /api/reviews
// @access  Public
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('product', 'title imageUrl')
    .sort({ createdAt: -1 });

  // Only return reviews that have a valid linked product
  const validReviews = reviews.filter(r => r.product !== null);
  res.json(validReviews);
});

module.exports = {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview,
};
