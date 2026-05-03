const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');


const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingInfo, paymentMethod, cardLastFour } = req.body;
  console.log('[CREATE ORDER] Received request from user:', req.user._id);
  console.log('[CREATE ORDER] Items:', orderItems?.length);

  // Validate order items
  if (!orderItems || orderItems.length === 0) {
    console.log('[CREATE ORDER] Validation failed: No items');
    res.status(400);
    throw new Error('No order items provided');
  }

  // Validate shipping info
  const { fullName, contactNumber, address, postalCode } = shippingInfo || {};
  if (!fullName || !contactNumber || !address || !postalCode) {
    console.log('[CREATE ORDER] Validation failed: Missing shipping info');
    res.status(400);
    throw new Error('All shipping fields are required');
  }

  // Validate payment method
  if (!['card', 'cod'].includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method. Must be "card" or "cod"');
  }

  // For card payments, validate card info
  if (paymentMethod === 'card' && (!cardLastFour || cardLastFour.length !== 4)) {
    res.status(400);
    throw new Error('Card last four digits are required for card payments');
  }

  // Calculate subtotal from order items
  let subtotal = 0;
  for (const item of orderItems) {
    subtotal += item.price * item.quantity;
  }

  const shippingFee = 15.00;
  const totalAmount = subtotal + shippingFee;

  // Validate stock and decrement
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      console.log(`[CREATE ORDER] Product not found: ${item.title}`);
      res.status(404);
      throw new Error(`Product not found: ${item.title}`);
    }
    if (product.stock < item.quantity) {
      console.log(`[CREATE ORDER] Insufficient stock for: ${product.title}`);
      res.status(400);
      throw new Error(`Insufficient stock for "${product.title}". Available: ${product.stock}`);
    }
    product.stock -= item.quantity;
    await product.save();
  }

  // Determine payment status
  const paymentStatus = paymentMethod === 'card' ? 'paid' : 'pending';

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingInfo: { fullName, contactNumber, address, postalCode },
    paymentMethod,
    paymentStatus,
    cardLastFour: paymentMethod === 'card' ? cardLastFour : undefined,
    subtotal,
    shippingFee,
    totalAmount,
  });

  const createdOrder = await order.save();
  console.log('[CREATE ORDER] Order saved successfully:', createdOrder._id);
  res.status(201).json(createdOrder);
});


const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});


const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    // Only allow the owner or admin to view the order
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});


const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});


const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure user owns this order
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  // Ensure the order is still in 'processing'
  if (order.orderStatus !== 'processing') {
    res.status(400);
    throw new Error(`Order cannot be cancelled because it is already ${order.orderStatus}`);
  }

  // Revert stock for each product
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.orderStatus = 'cancelled';
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});


const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { status } = req.body;
  if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  // If status is transitioning to cancelled from something else, revert stock
  if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  if (order.orderStatus === 'cancelled' && status !== 'cancelled') {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock < item.quantity) {
          res.status(400);
          throw new Error(`Cannot reactivate order. Insufficient stock for ${product.title}`);
        }
        product.stock -= item.quantity;
        await product.save();
      }
    }
  }

  order.orderStatus = status;
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
};
