const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  skinTypeTags: [{
    type: String,
    enum: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal', 'All'],
    default: ['All']
  }],
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Product', productSchema);
