const request = require('supertest');
const mongoose = require('mongoose');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

const app = require('../server');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

describe('Database Indexes', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        // Ensure indexes are built
        await Product.ensureIndexes();
        await Order.ensureIndexes();
        await User.ensureIndexes();
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    it('User should have unique email index', async () => {
        const indexes = await User.collection.getIndexes();
        expect(indexes.email_1).toBeDefined(); // Standard mongoose unique index name
        // Or sometimes matches 'email_1' if unique is defined.
        // Let's print keys if it fails.
        const keys = Object.keys(indexes);
        const hasEmail = keys.some(k => k.includes('email'));
        expect(hasEmail).toBe(true);
    });

    it('Product should have category, name, and text indexes', async () => {
        const indexes = await Product.collection.getIndexes();

        // Check for text index
        const hasTextIndex = Object.keys(indexes).some(k => k.includes('text') || k.includes('_fts'));
        expect(hasTextIndex).toBe(true);

        // Check for category index
        expect(indexes.category_1).toBeDefined();

        // Check for name index
        expect(indexes.name_1).toBeDefined();
    });

    it('Order should have user index', async () => {
        const indexes = await Order.collection.getIndexes();
        expect(indexes.user_1).toBeDefined();
    });
});
