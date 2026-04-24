const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    let adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('Creating default admin user...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123', // This will be hashed by the User model pre-save hook
        isAdmin: true,
      });
    }

    const products = [
      {
        user: adminUser._id,
        title: 'Acidic Refinement Nº7',
        price: 124.0,
        stock: 12,
        ingredients: ['Salicylic Acid 2%', 'Niacinamide', 'Squalane'],
        skinTypeTags: ['Oily', 'Combination'],
        category: 'SERUMS',
        imageUrl: '/uploads/sample-serum.jpg',
      },
      {
        user: adminUser._id,
        title: 'Botanical Hydration Mist',
        price: 85.0,
        stock: 5,
        ingredients: ['Rose Water', 'Hyaluronic Acid', 'Aloe Vera'],
        skinTypeTags: ['Sensitive', 'Dry'],
        category: 'MISTS',
        imageUrl: '/uploads/sample-mist.jpg',
      },
      {
        user: adminUser._id,
        title: 'Ceramide Shield Balme',
        price: 92.0,
        stock: 8,
        ingredients: ['Ceramides', 'Oat Kernel Oil', 'Honey'],
        skinTypeTags: ['Dry', 'Sensitive'],
        category: 'BALMS',
        imageUrl: '/uploads/sample-balm.jpg',
      },
      {
        user: adminUser._id,
        title: 'Molecular Cleansing Oil',
        price: 64.0,
        stock: 20,
        ingredients: ['Grapeseed Oil', 'Vitamin E', 'Bergamot'],
        skinTypeTags: ['All'],
        category: 'CLEANSERS',
        imageUrl: '/uploads/sample-cleanser.jpg',
      },
      {
        user: adminUser._id,
        title: 'Nightly Retinol Archive',
        price: 145.0,
        stock: 3,
        ingredients: ['Retinol 0.5%', 'Peptides', 'Bakuchiol'],
        skinTypeTags: ['Mature', 'Normal'],
        category: 'SERUMS',
        imageUrl: '/uploads/sample-retinol.jpg',
      }
    ];

    await Product.deleteMany();
    console.log('Existing products cleared.');

    await Product.insertMany(products);
    console.log('Sample products inserted successfully.');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
