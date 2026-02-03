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

describe('Product Pagination', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await Product.deleteMany({ description: 'Pagination Test' });
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    it('should return paginated results with default limit', async () => {
        // Create 15 products
        for (let i = 0; i < 15; i++) {
            await Product.create({
                name: `Product ${i}`,
                description: 'Pagination Test',
                price: 10 + i,
                category: 'electronics',
                stock: 10
            });
        }

        const res = await request(app).get('/api/products?search=Product');

        expect(res.statusCode).toBe(200);
        // Default limit should be 12 (as per requirement)
        expect(res.body.data.length).toBe(12);
        expect(res.body.pagination.limit).toBe(12);
        expect(res.body.pagination.total).toBeGreaterThanOrEqual(15);
        expect(res.body.pagination.pages).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for page out of range', async () => {
        const res = await request(app).get('/api/products?page=1000&limit=10');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(0);
    });

    it('should handle custom limit and page', async () => {
        const res = await request(app).get('/api/products?page=2&limit=5&search=Product');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(5);
        expect(res.body.pagination.page).toBe(2);
        expect(res.body.pagination.limit).toBe(5);
    });
});
