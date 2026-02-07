const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { connect, close, clear } = require('./db');

jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

describe('Reviews API Comprehensive', () => {
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
            email: 'user@review.com',
            password: 'StrongP@ssw0rd!',
            isEmailVerified: true
        });
        userId = user._id;
        userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Create Product
        product = await Product.create({
            name: 'Prod Review',
            description: 'Desc',
            price: 50,
            category: 'electronics',
            stock: 10
        });
    });

    describe('POST /api/reviews/:productId', () => {
        it('should create a review', async () => {
            const res = await request(app)
                .post(`/api/reviews/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    rating: 5,
                    comment: 'Great product!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.rating).toBe(5);
            expect(res.body.comment).toBe('Great product!');
            expect(res.body.user).toBeDefined(); // Populated
        });

        it('should return 400 for validation errors', async () => {
            const res = await request(app)
                .post(`/api/reviews/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    rating: 6, // Invalid > 5
                    comment: 'Too high'
                });
            // Express validator returns 400 with errors array
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeDefined();
        });

        it('should prevent duplicate reviews', async () => {
            // 1. Create first review manually or via API
            await Review.create({
                user: userId,
                product: product._id,
                rating: 4,
                comment: 'First'
            });

            // 2. Try to create second
            const res = await request(app)
                .post(`/api/reviews/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    rating: 5,
                    comment: 'Second'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toContain('already reviewed');
        });
    });

    describe('GET /api/reviews/:productId', () => {
        it('should list reviews', async () => {
            await Review.create({
                user: userId,
                product: product._id,
                rating: 4,
                comment: 'Good'
            });

            const res = await request(app).get(`/api/reviews/${product._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.reviews.length).toBe(1);
            expect(res.body.totalReviews).toBe(1);
        });
    });
});
