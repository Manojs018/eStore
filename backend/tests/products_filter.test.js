const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');

describe('Product Filtering', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    beforeEach(async () => {
        await Product.deleteMany({});

        // Seed products
        await Product.insertMany([
            {
                name: 'Laptop',
                description: 'Gaming Laptop',
                price: 1000,
                category: 'electronics',
                stock: 10,
                averageRating: 4.5
            },
            {
                name: 'Mouse',
                description: 'Wireless Mouse',
                price: 20,
                category: 'electronics',
                stock: 50,
                averageRating: 4.0
            },
            {
                name: 'Hammer',
                description: 'Heavy Duty Hammer',
                price: 15,
                category: 'tools',
                stock: 20,
                averageRating: 4.8
            },
            {
                name: 'Screwdriver',
                description: 'Multi-bit Screwdriver',
                price: 10,
                category: 'tools',
                stock: 30,
                averageRating: 3.5
            },
            {
                name: 'Expensive Tool',
                description: 'Very expensive tool',
                price: 200,
                category: 'tools',
                stock: 5,
                averageRating: 5.0
            }
        ]);
    });

    it('should filter by category', async () => {
        const res = await request(app)
            .get('/api/products/filter?category=electronics');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0].category).toBe('electronics');
        expect(res.body.facets.categories).toHaveProperty('electronics');
    });

    it('should filter by price range', async () => {
        const res = await request(app)
            .get('/api/products/filter?minPrice=10&maxPrice=50');

        expect(res.statusCode).toBe(200);
        // Should match Mouse(20), Hammer(15), Screwdriver(10)
        expect(res.body.data.length).toBe(3);
    });

    it('should filter by rating', async () => {
        const res = await request(app)
            .get('/api/products/filter?rating=4.5');

        expect(res.statusCode).toBe(200);
        // Should match Laptop(4.5), Hammer(4.8), Expensive Tool(5.0)
        expect(res.body.data.length).toBe(3);
    });

    it('should combined filters', async () => {
        // Electronics under 50
        const res = await request(app)
            .get('/api/products/filter?category=electronics&maxPrice=50');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1); // Mouse
        expect(res.body.data[0].name).toBe('Mouse');
    });

    it('should sort results', async () => {
        const res = await request(app)
            .get('/api/products/filter?sort=price-asc');

        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].price).toBe(10); // Screwdriver
        expect(res.body.data[4].price).toBe(1000); // Laptop
    });

    it('should return facets', async () => {
        const res = await request(app)
            .get('/api/products/filter');

        expect(res.body.facets.categories).toBeDefined();
        expect(res.body.facets.categories.electronics).toBe(2);
        expect(res.body.facets.categories.tools).toBe(3);
    });
});
