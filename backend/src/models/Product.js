const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['SERUMS', 'OILS', 'CLEANSERS', 'BALMS', 'MISTS', 'NONE'],
    default: 'NONE'
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
    enum: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal', 'Mature', 'All'],
    default: ['All']
  }],
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required']
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);

