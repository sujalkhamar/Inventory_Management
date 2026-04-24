const fs = require('fs');
const csv = require('csv-parser');
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

    await logActivity(req.user.id, 'Product Created', `Added ${product.name} to inventory`, product._id);

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

    await logActivity(req.user.id, 'Product Updated', `Updated details for ${product.name}`, product._id);

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

// @desc    Import products from CSV
// @route   POST /api/products/import
// @access  Private/Admin
exports.importProducts = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('Please upload a CSV file', 400));
    }

    const products = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            products.push({
                name: row.name,
                category: row.category,
                stock: parseInt(row.stock) || 0,
                price: parseFloat(row.price) || 0,
                costPrice: parseFloat(row.costPrice) || 0,
                supplier: row.supplier,
                location: row.location || 'Imported'
            });
        })
        .on('end', async () => {
            try {
                if (products.length > 0) {
                    await Product.insertMany(products);
                }
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                res.status(201).json({ success: true, count: products.length, data: products });
            } catch (err) {
                console.error(err);
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                res.status(500).json({ success: false, error: 'Error importing products' });
            }
        });
});
