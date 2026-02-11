const express = require('express');
const router = express.Router();
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { auth: protect, admin } = require('../middleware/auth');

// Track Event
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: User analytics and tracking
 */

/**
 * @swagger
 * /api/analytics/event:
 *   post:
 *     summary: Track a user event
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 example: pageview
 *               guestId:
 *                 type: string
 *               url:
 *                 type: string
 *               userId:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Event tracked
 */
router.post('/event', async (req, res) => {
    try {
        const { eventType, guestId, url, metadata } = req.body;

        // Check if user is authenticated via header (optional logic)
        // Here we'll rely on frontend passing userId if available or backend middleware adding it
        // For simplicity, we just save what's sent or use req.user if present

        let userId = null;
        // Assuming middleware populates req.user if token is present, but this route might be public for tracking?
        // Let's make it public but try to extract user if possible.
        // Actually, for tracking, we usually don't want to enforce auth.
        // The frontend sends userId if known.

        if (req.body.userId) userId = req.body.userId;

        await AnalyticsEvent.create({
            eventType,
            userId,
            guestId,
            url,
            metadata,
            timestamp: new Date()
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Analytics Error:', err);
        // Don't block the client
        res.status(200).json({ success: false });
    }
});

// Admin Dashboard Stats
/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get analytics dashboard data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get('/dashboard', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else {
            // Default last 30 days
            const d = new Date();
            d.setDate(d.getDate() - 30);
            query.timestamp = { $gte: d };
        }

        // 1. Total Page Views
        const totalPageViews = await AnalyticsEvent.countDocuments({ ...query, eventType: 'pageview' });

        // 2. Unique Visitors (approximated by guestId)
        const uniqueVisitors = (await AnalyticsEvent.distinct('guestId', { ...query })).length;

        // 3. Funnel Data
        /*
           Funnel Steps:
           1. View Product -> 'view_item'
           2. Add to Cart -> 'add_to_cart'
           3. Checkout Start -> 'begin_checkout'
           4. Purchase -> 'purchase'
        */
        const viewItemCount = await AnalyticsEvent.countDocuments({ ...query, eventType: 'view_item' });
        const addToCartCount = await AnalyticsEvent.countDocuments({ ...query, eventType: 'add_to_cart' });
        const checkoutStartCount = await AnalyticsEvent.countDocuments({ ...query, eventType: 'begin_checkout' });
        const purchaseCount = await AnalyticsEvent.countDocuments({ ...query, eventType: 'purchase' });

        // 4. Recent Activity (Latest 10 events)
        const recentEvents = await AnalyticsEvent.find(query).sort({ timestamp: -1 }).limit(10).lean();

        // 5. Retention Cohorts (Simplified: New vs Returning Users)
        // Users with > 1 session or first seen date vs event date check.
        // A simplified metric: Active Users over time (daily)

        // Group by Day
        const dailyViews = await AnalyticsEvent.aggregate([
            { $match: { ...query, eventType: 'pageview' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    views: { $sum: 1 },
                    uniqueUsers: { $addToSet: "$guestId" }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    date: "$_id",
                    views: 1,
                    uniqueUsers: { $size: "$uniqueUsers" }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalPageViews,
                uniqueVisitors,
                funnel: {
                    view_item: viewItemCount,
                    add_to_cart: addToCartCount,
                    begin_checkout: checkoutStartCount,
                    purchase: purchaseCount
                },
                recentEvents,
                dailyActivity: dailyViews
            }
        });

    } catch (err) {
        console.error('Analytics Dashboard Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
