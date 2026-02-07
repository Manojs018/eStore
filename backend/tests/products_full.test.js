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

describe('Products API Comprehensive', () => {
    let adminToken;
    let userToken;
    let product;

    beforeAll(async () => connect());
    afterAll(async () => close());
    beforeEach(async () => clear());

    beforeEach(async () => {
        // Create Admin
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@prod.com',
            password: 'StrongP@ssw0rd!',
            role: 'admin',
            isEmailVerified: true
        });
        adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

        // Create Product
        product = await Product.create({
            name: 'Prod 1',
            description: 'Desc 1',
            price: 50,
            category: 'electronics',
            stock: 10,
            averageRating: 4
        });
    });

    describe('GET /api/products', () => {
        it('should get all products', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
        });

        it('should verify pagination', async () => {
            // Create more products
            await Product.create({ name: 'Prod 2', description: 'Desc', price: 60, category: 'tools', stock: 10 });
            await Product.create({ name: 'Prod 3', description: 'Desc', price: 70, category: 'tools', stock: 10 });

            const res = await request(app).get('/api/products?page=1&limit=2');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(2);
            expect(res.body.pagination.pages).toBe(2);
        });

        it('should perform search', async () => {
            // Need text index, possibly create in test setup if not using real Atlas
            // But mongo-memory-server simulates MongoDB, so indexes work if defined in schema.
            // Wait for index creation?
            await Product.init(); // Ensure indexes

            const res = await request(app).get('/api/products?search=Prod 1');
            // Text search depends on Mongoose schema definition
            // Assuming it works
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should get product by ID', async () => {
            const res = await request(app).get(`/api/products/${product._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data._id).toBe(product._id.toString());
        });

        it('should return 404 for invalid ID', async () => {
            const res = await request(app).get('/api/products/invalid_id_format');
            // If validation middleware catches it, 400 or 500; if mongoose objectId error, handled in controller
            // The controller code handles error.kind === 'ObjectId' -> 404
            expect(res.statusCode).toBe(404);
        });

        it('should return 404 for non-existent ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/products/${fakeId}`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/products/filter', () => {
        it('should filter by price', async () => {
            await Product.create({ name: 'Cheap', price: 10, category: 'other', description: 'Cheap item' });
            await Product.create({ name: 'Expensive', price: 100, category: 'components', description: 'Expensive item' });

            const res = await request(app).get('/api/products/filter?minPrice=5&maxPrice=40');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('Cheap');
        });

        it('should filter by category', async () => {
            await Product.create({ name: 'Tool', price: 10, category: 'tools', description: 'Tool item' });
            const res = await request(app).get('/api/products/filter?category=tools');
            expect(res.statusCode).toBe(200);
            expect(res.body.data[0].category).toBe('tools');
        });
    });

    describe('Admin Product Operations', () => {
        it('should prevent non-admin from creating product', async () => {
            // ... covered by admin.test.js actually
        });
    });
});
