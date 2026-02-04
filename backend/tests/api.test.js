// Backend tests for authentication routes
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

// Mock email sending
// Mock email sending
jest.mock('../utils/sendEmail');

// Mock rate limiter
jest.mock('../middleware/rateLimiter', () => ({
  authLimiter: (req, res, next) => next(),
  apiLimiter: (req, res, next) => next(),
  searchLimiter: (req, res, next) => next(),
}));

describe('Authentication Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongP@ssw0rd!',
          mobile: '1234567890'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('user');
    });

    it('should not register user with existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!',
        mobile: '1234567890'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongP@ssw0rd!',
          mobile: '1234567890'
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!',
        mobile: '1234567890',
        isEmailVerified: true
      });
    });

    it('should login user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'StrongP@ssw0rd!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});

describe('Products Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});

describe('Health Check', () => {
});