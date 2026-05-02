const mongoose = require('mongoose');
const Review = require('./src/models/Review');
require('dotenv').config();

const checkReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const reviews = await Review.find({}).populate('product', 'title');
    console.log('Total Reviews:', reviews.length);
    reviews.forEach(r => {
      console.log(`- [${r.product?.title || 'Unknown Product'}] ${r.name}: ${r.comment} (${r.rating} stars)`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkReviews();
