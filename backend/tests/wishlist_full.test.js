const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const { connect, close, clear } = require('./db');

jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('Wishlist API Comprehensive', () => {
    let userToken;
    let userId;
    let product;

    beforeAll(async () => connect());
    afterAll(async () => close());
    beforeEach(async () => clear());

    beforeEach(async () => {
        // Create User
        const user = await User.create({
            name: 'User',
            email: 'wishlist@test.com',
            password: 'StrongP@ssw0rd!',
            isEmailVerified: true
        });
        userId = user._id;
        userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Create Product
        product = await Product.create({
            name: 'Prod Wish',
            description: 'Desc',
            price: 50,
            category: 'electronics',
            stock: 10
        });
    });

    describe('GET /api/wishlist', () => {
        it('should return empty array for new user', async () => {
            const res = await request(app)
                .get('/api/wishlist')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it('should return populated products', async () => {
            await Wishlist.create({
                user: userId,
                products: [product._id]
            });

            const res = await request(app)
                .get('/api/wishlist')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe('Prod Wish');
        });
    });

    describe('PUT /api/wishlist/:productId', () => {
        it('should add product to wishlist', async () => {
            const res = await request(app)
                .put(`/api/wishlist/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe('Prod Wish');

            // Verify DB
            const wishlist = await Wishlist.findOne({ user: userId });
            expect(wishlist.products.length).toBe(1);
        });

        it('should remove product from wishlist (toggle)', async () => {
            // Add first
            await request(app)
                .put(`/api/wishlist/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            // Remove
            const res = await request(app)
                .put(`/api/wishlist/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(0);
        });
    });
});
