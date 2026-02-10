const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample products data
const products = [
  {
    name: 'Resistor',
    description: 'A high-quality resistor for electronic circuits. Perfect for prototyping and production use.',
    price: 5.00,
    category: 'components',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Capacitor',
    description: 'Electrolytic capacitor with excellent performance and reliability for various applications.',
    price: 10.00,
    category: 'components',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1563770095-39d468f9a51d?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Arduino Board',
    description: 'Arduino Uno R3 microcontroller board for building interactive electronic projects.',
    price: 25.00,
    category: 'electronics',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=60'
  }
];

// Sample admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@estore.com',
  password: 'admin123',
  role: 'admin',
  isEmailVerified: true
};

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();

    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products imported`);

    // Create admin user
    const createdAdmin = await User.create(adminUser);
    console.log(`Admin user created: ${createdAdmin.email}`);

    console.log('Data Import Success!');
    process.exit();
  } catch (error) {
    console.error('Data Import Error:', error);
    process.exit(1);
  }
};

// Delete data
const destroyData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error('Data Destroy Error:', error);
    process.exit(1);
  }
};

// Run based on command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}