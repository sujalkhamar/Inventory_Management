const asyncHandler = require('../middleware/async');
const InventoryMovement = require('../models/InventoryMovement');

// @desc    Get inventory movements (optionally filtered)
// @route   GET /api/movements
// @access  Private
exports.getMovements = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.productId) {
        filter.product = req.query.productId;
    }
    if (req.query.warehouseId) {
        filter.warehouse = req.query.warehouseId;
    }
    if (req.query.reason) {
        filter.reason = req.query.reason;
    }

    const [total, movements] = await Promise.all([
        InventoryMovement.countDocuments(filter),
        InventoryMovement.find(filter)
            .populate('product', 'name category')
            .populate('warehouse', 'name location')
            .populate('createdBy', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
    ]);

    res.status(200).json({
        success: true,
        page,
        limit,
        total,
        count: movements.length,
        data: movements
    });
});

