const request = require('supertest');
const mongoose = require('mongoose');
const Order = require('../models/Order');

// Mock Rate Limiter and Logger
jest.mock('../middleware/rateLimiter', () => ({
    authLimiter: (req, res, next) => next(),
    apiLimiter: (req, res, next) => next(),
    searchLimiter: (req, res, next) => next(),
}));

jest.mock('../utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
}));

// Mock Stripe
// verify signature needs to pass if correct signature
const mockConstructEvent = jest.fn();
jest.mock('stripe', () => {
    return jest.fn(() => ({
        webhooks: {
            constructEvent: mockConstructEvent
        }
    }));
});

const app = require('../server');

describe('Stripe Webhooks', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        mockConstructEvent.mockReset();
        // Clear orders to ensure findOne returns the current test's order
        await Order.deleteMany({ paymentIntentId: 'pi_test_webhook' });
    });

    it('should return 400 for invalid signature', async () => {
        mockConstructEvent.mockImplementation(() => {
            throw new Error('Invalid signature');
        });

        const res = await request(app)
            .post('/api/webhooks/stripe')
            .set('stripe-signature', 'invalid')
            .send({ some: 'data' });

        expect(res.statusCode).toBe(400);
        expect(res.text).toContain('Webhook Error');
    });

    it('should process payment_intent.succeeded', async () => {
        // Create an order first
        const order = await Order.create({
            user: new mongoose.Types.ObjectId(),
            items: [],
            totalAmount: 50,
            shippingAddress: { street: 'Main', city: 'NY', state: 'NY', zipCode: '10001', country: 'US' },
            paymentIntentId: 'pi_test_webhook',
            paymentStatus: 'pending',
            stripePaymentIntentId: 'pi_test_webhook'
        });

        const eventPayload = {
            id: 'evt_test',
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_test_webhook',
                    amount: 5000,
                    status: 'succeeded'
                }
            }
        };

        mockConstructEvent.mockReturnValue(eventPayload);

        const res = await request(app)
            .post('/api/webhooks/stripe')
            .set('stripe-signature', 'valid_sig')
            .send(eventPayload); // In unit test, supertest sends JSON by default. 
        // express.raw() parses it?
        // Actually, if we send .send(json), header is application/json.
        // express.raw({ type: 'application/json' }) will parse it into buffer.
        // But `stripe.constructEvent` expects buffer.
        // supertest might send string if we pass object.

        expect(res.statusCode).toBe(200);

        // Verify order status
        const updatedOrder = await Order.findById(order._id);
        expect(updatedOrder.paymentStatus).toBe('paid');
        expect(updatedOrder.paidAt).toBeDefined();

        await Order.findByIdAndDelete(order._id);
    });
});
