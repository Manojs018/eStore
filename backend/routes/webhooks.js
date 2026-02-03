const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const logger = require('../utils/logger');

// @route   POST /api/webhooks/stripe
// @desc    Handle Stripe Webhooks
// @access  Public (Signature verified)
router.post('/stripe', async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        // req.body must be raw buffer here
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        logger.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    /*
      Tip: For PaymentIntent events, the object is inside event.data.object
    */

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        logger.info(`Webhook: Payment Intent Succeeded: ${paymentIntent.id}`);

        try {
            const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

            if (order) {
                if (order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.paidAt = Date.now();
                    // Add logic to update status if needed. 
                    // Assuming 'processing' is the state after payment.
                    // If it was 'pending' awaiting payment.
                    // Our Order creation currently sets 'paid' immediately if confirmed via API.
                    // But if we use Stripe Checkout Session or delayed capture, this is critical.
                    await order.save();
                    logger.info(`Order ${order._id} updated to paid via webhook`);
                }
            } else {
                logger.warn(`Webhook: Order not found for PaymentIntent ${paymentIntent.id}`);
                // This might happen if webhook arrives before Order creation logic finishes, 
                // or if the checkout flow creates Order AFTER payment (e.g. client side callback).
                // Usually we create Order 'pending' then confirm.
            }
        } catch (err) {
            logger.error(`Webhook Error updating order: ${err.message}`);
            return res.status(500).json({ error: 'Server Error' });
        }
    } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        logger.warn(`Webhook: Payment Intent Failed: ${paymentIntent.id}`);
        // Optionally find order and mark as failed
    }

    res.json({ received: true });
});

module.exports = router;
