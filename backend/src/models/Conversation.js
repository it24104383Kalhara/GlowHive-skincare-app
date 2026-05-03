const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productTitle: {
    type: String,
  },
  lastMessage: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastMessageSenderId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
},
unreadCount: {
  type: Number,
  default: 0,
},
}, { timestamps: true });

conversationSchema.index({ customerId: 1, sellerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);