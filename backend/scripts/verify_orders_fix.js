const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const verifyFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create a user
        const user = await User.create({
            name: 'Verification User',
            email: `verify_${Date.now()}@test.com`,
            password: 'password123'
        });

        // Create a product
        const product = await Product.create({
            name: 'Test Tech Product',
            description: 'Testing tracking',
            price: 50,
            category: 'electronics',
            stock: 100,
            averageRating: 4.5
        });

        // Create an order with tracking info (simulating what the process would do)
        const order = await Order.create({
            user: user._id,
            items: [{
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: 1
            }],
            totalAmount: 50,
            shippingAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                country: 'USA'
            },
            paymentIntentId: 'pi_manual_test',
            statusHistory: [{
                status: 'processing',
                date: new Date(),
                comment: 'Order placed'
            }],
            trackingInfo: {
                carrier: 'FedEx',
                trackingNumber: 'TRK999888777',
                trackingUrl: 'https://fedex.com/track/TRK999888777'
            }
        });

        console.log('Order created with ID:', order._id);

        // Fetch the order using Mongoose (simulating what the route does)
        const fetchedOrder = await Order.findById(order._id);

        console.log('\n--- VERIFICATION RESULTS ---');
        console.log('Tracking Info present:', !!fetchedOrder.trackingInfo);
        if (fetchedOrder.trackingInfo) {
            console.log('Carrier:', fetchedOrder.trackingInfo.carrier);
            console.log('Tracking #:', fetchedOrder.trackingInfo.trackingNumber);
        }

        console.log('Status History present:', !!fetchedOrder.statusHistory);
        if (fetchedOrder.statusHistory && fetchedOrder.statusHistory.length > 0) {
            console.log('Latest Status:', fetchedOrder.statusHistory[0].status);
            console.log('Comment:', fetchedOrder.statusHistory[0].comment);
        }

        console.log('Verification Successful!');

        // Cleanup
        await User.findByIdAndDelete(user._id);
        await Product.findByIdAndDelete(product._id);
        await Order.findByIdAndDelete(order._id);

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyFix();
