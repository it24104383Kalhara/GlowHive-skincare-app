const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountAmount, minOrderAmount, expiryDate, isActive } = req.body;

  const numCount = (code.match(/\d/g) || []).length;
  if (numCount < 2) {
    res.status(400);
    throw new Error('Coupon code must contain at least 2 numbers');
  }

  if (discountType === 'fixed' && discountAmount > 100) {
    res.status(400);
    throw new Error('Fixed discount amount cannot exceed $100');
  }

  if (discountType === 'percentage' && discountAmount > 50) {
    res.status(400);
    throw new Error('Percentage discount cannot exceed 50%');
  }

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = new Coupon({
    code,
    discountType,
    discountAmount,
    minOrderAmount,
    expiryDate,
    isActive,
  });

  const createdCoupon = await coupon.save();
  res.status(201).json(createdCoupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  res.json(coupons);
});

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    res.json(coupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountAmount, minOrderAmount, expiryDate, isActive } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    const finalCode = code || coupon.code;
    const finalDiscountType = discountType || coupon.discountType;
    const finalDiscountAmount = discountAmount !== undefined ? discountAmount : coupon.discountAmount;

    const numCount = (finalCode.match(/\d/g) || []).length;
    if (numCount < 2) {
      res.status(400);
      throw new Error('Coupon code must contain at least 2 numbers');
    }

    if (finalDiscountType === 'fixed' && finalDiscountAmount > 100) {
      res.status(400);
      throw new Error('Fixed discount amount cannot exceed $100');
    }

    if (finalDiscountType === 'percentage' && finalDiscountAmount > 50) {
      res.status(400);
      throw new Error('Percentage discount cannot exceed 50%');
    }

    coupon.code = finalCode;
    coupon.discountType = finalDiscountType;
    coupon.discountAmount = finalDiscountAmount;
    coupon.minOrderAmount = minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount;
    coupon.expiryDate = expiryDate || coupon.expiryDate;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isActive) {
    res.status(400);
    throw new Error('This coupon is no longer active');
  }

  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    res.status(400);
    throw new Error('This coupon has expired');
  }

  if (subtotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount of $${coupon.minOrderAmount} is required`);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountAmount) / 100;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountAmount;
  }

  // Cap discount at subtotal
  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  res.json({
    code: coupon.code,
    discountAmount,
    message: 'Coupon applied successfully',
  });
});

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
