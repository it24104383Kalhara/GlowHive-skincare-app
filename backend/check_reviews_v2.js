const mongoose = require('mongoose');
require('dotenv').config();

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.Mixed }, // Use Mixed to see if strings are there
  name: String,
  comment: String,
  rating: Number
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

const checkReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const reviews = await Review.find({});
    console.log('Total Reviews in DB:', reviews.length);
    reviews.forEach(r => {
      console.log(`- ID: ${r._id}, Product: ${r.product}, User: ${r.user}, Comment: ${r.comment}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
};

checkReviews();
