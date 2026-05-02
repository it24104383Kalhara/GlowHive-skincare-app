const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [orderItemSchema],
  shippingInfo: {
    fullName: { type: String, required: [true, 'Full name is required'] },
    contactNumber: { type: String, required: [true, 'Contact number is required'] },
    address: { type: String, required: [true, 'Address is required'] },
    postalCode: { type: String, required: [true, 'Postal code is required'] },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'cod'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  cardLastFour: {
    type: String,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 15.00,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
