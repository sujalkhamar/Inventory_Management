const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const logActivity = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getSales = asyncHandler(async (req, res, next) => {
    const sales = await Sale.find().populate({
        path: 'product',
        select: 'name category'
    }).populate({
        path: 'soldBy',
        select: 'name email'
    }).sort('-date');

    res.status(200).json({
        success: true,
        count: sales.length,
        data: sales
    });
});

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
exports.createSale = asyncHandler(async (req, res, next) => {
    const { product: productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }

    if (product.stock < quantity) {
        return next(new ErrorResponse(`Not enough stock. Available: ${product.stock}`, 400));
    }

    // Calculate total price
    const totalPrice = product.price * quantity;
    const profit = (product.price - product.costPrice) * quantity;

    // Create sale record
    const sale = await Sale.create({
        product: productId,
        quantity,
        totalPrice,
        profit,
        soldBy: req.user.id
    });

    // Deduct stock
    product.stock -= quantity;
    await product.save();

    // Check for low stock alert
    if (product.stock <= product.lowStockThreshold) {
        try {
            await sendEmail({
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                subject: `LOW STOCK ALERT: ${product.name}`,
                message: `The product "${product.name}" (ID: ${product._id}) has reached critical stock levels.\n\nCurrent Stock: ${product.stock}\nLocation: ${product.location}\nSupplier: ${product.supplier}\n\nPlease restock soon.`
            });
            console.log(`Low stock email sent for ${product.name}`);
        } catch (err) {
            console.error('Email failed to send:', err.message);
        }
    }

    await logActivity(req.user.id, 'Sale Recorded', `Sold ${quantity}x ${product.name}`, product._id);

    res.status(201).json({
        success: true,
        data: sale
    });
});

// @desc    Get analytics
// @route   GET /api/sales/analytics
// @access  Private
exports.getAnalytics = asyncHandler(async (req, res, next) => {
    // Low stock products
    const lowStockProducts = await Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } });

    // Sales stats
    const salesStats = await Sale.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                totalProfit: { $sum: '$profit' },
                totalSales: { $sum: 1 }
            }
        }
    ]);

    const totalRevenue = salesStats.length > 0 ? salesStats[0].totalRevenue : 0;
    const totalProfit = salesStats.length > 0 ? salesStats[0].totalProfit : 0;
    const totalSales = salesStats.length > 0 ? salesStats[0].totalSales : 0;

    // Top selling products aggregate
    const topProducts = await Sale.aggregate([
        {
            $group: {
                _id: "$product",
                totalSold: { $sum: "$quantity" },
                totalRevenue: { $sum: "$totalPrice" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $project: {
                name: '$productDetails.name',
                totalSold: 1,
                totalRevenue: 1
            }
        }
    ]);

    // Revenue over time (simple daily aggregation)
    const revenueOverTime = await Sale.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                dailyRevenue: { $sum: "$totalPrice" },
                dailyProfit: { $sum: "$profit" }
            }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
    ]);

    // Recent activities
    const recentActivities = await Activity.find()
        .populate('user', 'name')
        .sort('-createdAt')
        .limit(10);

    res.status(200).json({
        success: true,
        data: {
            totalRevenue,
            totalProfit,
            totalSales,
            lowStockCount: lowStockProducts.length,
            topProducts,
            revenueOverTime,
            recentActivities
        }
    });
});
