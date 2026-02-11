const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// Use test key if not provided for finding bugs/testing flow (won't actually process)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing
 */

// @route   POST /api/payment/create-payment-intent
// @desc    Create payment intent
// @access  Private
/**
 * @swagger
 * /api/payment/create-payment-intent:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - shippingInfo
 *             properties:
 *               amount:
 *                 type: integer
 *               shippingInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment intent client secret
 *       401:
 *         description: Unauthorized
 */
router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { amount, shippingInfo } = req.body;

        if (!process.env.STRIPE_SECRET_KEY) {
            // Mock response for development without keys
            // valid-looking mock secret for testing flows (will likely fail at stripe confirmation)
            return res.json({
                clientSecret: 'pi_mock_secret_key_for_testing_123456789',
                mock: true
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            description: 'eStore Payment',
            shipping: {
                name: req.user.name,
                address: {
                    line1: shippingInfo.address,
                    city: shippingInfo.city,
                    postal_code: shippingInfo.zipCode,
                    country: shippingInfo.country,
                },
            },
            metadata: {
                userId: req.user.id
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe Error:', err.message);
        res.status(500).send('Payment Server Error');
    }
});

module.exports = router;
