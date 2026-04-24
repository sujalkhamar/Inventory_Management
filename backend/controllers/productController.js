const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Product = require('../models/Product');
const logActivity = require('../utils/logger');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = asyncHandler(async (req, res, next) => {
    let query;

    // Search logic
    const searchFilter = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { category: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {};

    // Low stock filter logic
    const stockFilter = req.query.filter === 'lowstock' ? {
        $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    } : {};

    // Combine filters
    query = Product.find({ ...searchFilter, ...stockFilter });

    // Sort
    query = query.sort('-createdAt');

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await Product.countDocuments({ ...searchFilter, ...stockFilter });

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query;

    res.status(200).json({
        success: true,
        count: products.length,
        total,
        data: products
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.create(req.body);

    await logActivity(req.user.id, 'Product Created', `Added ${product.name} to inventory`);

    res.status(201).json({
        success: true,
        data: product
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    await logActivity(req.user.id, 'Product Updated', `Updated details for ${product.name}`);

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    await Product.deleteOne({ _id: req.params.id });

    await logActivity(req.user.id, 'Product Deleted', `Removed product ID: ${req.params.id}`);

    res.status(200).json({
        success: true,
        data: {}
    });
});
