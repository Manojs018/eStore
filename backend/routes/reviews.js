const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// @route   GET /api/reviews/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/:productId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ product: req.params.productId });

        res.json({
            reviews,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalReviews: total
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/reviews/:productId
// @desc    Add a review
// @access  Private
router.post(
    '/:productId',
    [
        auth,
        [
            check('rating', 'Rating is required').not().isEmpty(),
            check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
            check('comment', 'Comment is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { rating, comment } = req.body;

            // Check if user already reviewed
            const existingReview = await Review.findOne({
                product: req.params.productId,
                user: req.user.id
            });

            if (existingReview) {
                return res.status(400).json({ msg: 'You have already reviewed this product' });
            }

            const review = new Review({
                product: req.params.productId,
                user: req.user.id,
                rating,
                comment
            });

            await review.save();

            // Populate user details for immediate display
            await review.populate('user', 'name');

            res.json(review);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT /api/reviews/:id/vote
// @desc    Vote review as helpful
// @access  Private
router.put('/:id/vote', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ msg: 'Review not found' });
        }

        // Check if review belongs to user (optional: prevent voting on own review? let's allow for simplicity or block it)
        if (review.user.toString() === req.user.id) {
            // usually users can't mark their own useful, but let's just proceed for now or block
        }

        // Toggle vote
        const index = review.helpful.indexOf(req.user.id);
        if (index === -1) {
            review.helpful.push(req.user.id);
        } else {
            review.helpful.splice(index, 1);
        }

        await review.save();
        res.json(review.helpful);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
