const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, beforeImage, afterImage, productId } = req.body;

  const product = await Product.findById(productId);

  if (product) {
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
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

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
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
