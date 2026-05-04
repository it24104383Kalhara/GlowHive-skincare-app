const mongoose = require('mongoose');

const skinLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  hydration: {
    type: String,
    required: [true, 'Hydration level is required'],
    enum: ['Dry', 'Normal', 'Oily'],
  },
  acne: {
    type: String,
    required: [true, 'Acne condition is required'],
    enum: ['None', 'Mild', 'Moderate', 'Severe'],
  },
  productsUsed: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  imageUrl: {
    type: String,
    required: [true, 'Skin selfie image is required'],
  },
}, {
  timestamps: true,
});

// Index for efficient per-user queries sorted by date
skinLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('SkinLog', skinLogSchema);
