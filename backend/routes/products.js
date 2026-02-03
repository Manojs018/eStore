const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { auth, admin } = require('../middleware/auth');

const { searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', searchLimiter, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const category = req.query.category || '';

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Filter products with advanced options
// @route   GET /api/products/filter
// @access  Public
router.get('/filter', searchLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const { category, minPrice, maxPrice, rating, sort } = req.query;

    let query = {
      isActive: true,
      isDeleted: false
    };

    // Category Filter
    if (category) {
      query.category = category;
    }

    // Price Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Sort
    let sortOption = { createdAt: -1 }; // Default newest
    if (sort) {
      if (sort === 'price-asc') sortOption = { price: 1 };
      else if (sort === 'price-desc') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { averageRating: -1 };
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    // Facets (Category counts)
    // We match the query *without* the category filter to show all available categories for current price/rating range
    const facetQuery = { ...query };
    delete facetQuery.category;

    const categoryFacets = await Product.aggregate([
      { $match: facetQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const facets = {
      categories: categoryFacets.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      facets
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    }).limit(4);

    const productObj = product.toObject();
    productObj.reviews = reviews;
    productObj.relatedProducts = relatedProducts;

    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', auth, admin, [
  body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('description').trim().isLength({ max: 1000 }).escape(),
  body('price').isFloat({ min: 0 }),
  body('category').isIn(['electronics', 'components', 'tools', 'other']),
  body('stock').isInt({ min: 0 }),
  body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid URL'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', auth, admin, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).escape(),
  body('description').optional().trim().isLength({ max: 1000 }).escape(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['electronics', 'components', 'tools', 'other']),
  body('stock').optional().isInt({ min: 0 }),
  body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid URL'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;