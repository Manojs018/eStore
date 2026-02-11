const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: '../.env' }); // Adjust path if needed

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/estore', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const ensureAdmin = async () => {
    await connectDB();

    const email = 'admin@estore.com';
    const password = 'admin123';

    let user = await User.findOne({ email });

    if (!user) {
        console.log('Admin user not found. Creating...');
        user = await User.create({
            name: 'Admin User',
            email,
            password,
            role: 'admin',
            isEmailVerified: true,
            isActive: true
        });
        console.log('Admin created.');
    } else {
        console.log('Admin user found. Updating...');
        user.password = password; // Triggers hash
        user.role = 'admin';
        user.isEmailVerified = true;
        user.isActive = true;
        user.twoFactorEnabled = false; // Reset 2FA for testing
        user.twoFactorSecret = undefined;
        await user.save();
        console.log('Admin updated.');
    }

    process.exit();
};

ensureAdmin();
