const asyncHandler = require('../middleware/async');
const PurchaseOrder = require('../models/PurchaseOrder');

// @desc    Supplier lead time stats (days) for received POs
// @route   GET /api/analytics/suppliers/lead-times
// @access  Private
exports.getSupplierLeadTimes = asyncHandler(async (req, res, next) => {
    const daysBack = Math.min(parseInt(req.query.days, 10) || 180, 365);
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const stats = await PurchaseOrder.aggregate([
        {
            $match: {
                status: 'Received',
                receivedAt: { $ne: null, $gte: since },
                createdAt: { $ne: null }
            }
        },
        {
            $project: {
                supplier: 1,
                leadTimeDays: {
                    $divide: [
                        { $subtract: ['$receivedAt', '$createdAt'] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$supplier',
                count: { $sum: 1 },
                avgLeadTimeDays: { $avg: '$leadTimeDays' },
                minLeadTimeDays: { $min: '$leadTimeDays' },
                maxLeadTimeDays: { $max: '$leadTimeDays' }
            }
        },
        { $sort: { avgLeadTimeDays: 1 } },
        {
            $lookup: {
                from: 'suppliers',
                localField: '_id',
                foreignField: '_id',
                as: 'supplier'
            }
        },
        { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                supplierId: '$_id',
                supplierName: '$supplier.name',
                count: 1,
                avgLeadTimeDays: { $round: ['$avgLeadTimeDays', 2] },
                minLeadTimeDays: { $round: ['$minLeadTimeDays', 2] },
                maxLeadTimeDays: { $round: ['$maxLeadTimeDays', 2] }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            daysBack,
            suppliers: stats
        }
    });
});

