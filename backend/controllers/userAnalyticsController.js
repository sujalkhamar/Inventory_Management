const asyncHandler = require('../middleware/async');
const Sale = require('../models/Sale');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryMovement = require('../models/InventoryMovement');

// @desc    Current user impact summary
// @route   GET /api/analytics/users/me/summary
// @access  Private
exports.getMySummary = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const [
        saleStats,
        poStats,
        movementStats
    ] = await Promise.all([
        Sale.aggregate([
            { $match: { soldBy: req.user._id } },
            {
                $group: {
                    _id: null,
                    salesCount: { $sum: 1 },
                    unitsSold: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$totalPrice' },
                    totalProfit: { $sum: '$profit' }
                }
            }
        ]),
        PurchaseOrder.aggregate([
            { $match: { createdBy: req.user._id } },
            {
                $group: {
                    _id: null,
                    poCount: { $sum: 1 },
                    totalCost: { $sum: '$totalCost' }
                }
            }
        ]),
        InventoryMovement.aggregate([
            { $match: { createdBy: req.user._id } },
            {
                $group: {
                    _id: null,
                    movementCount: { $sum: 1 },
                    netQuantityDelta: { $sum: '$quantityDelta' }
                }
            }
        ])
    ]);

    const s = saleStats[0] || { salesCount: 0, unitsSold: 0, totalRevenue: 0, totalProfit: 0 };
    const p = poStats[0] || { poCount: 0, totalCost: 0 };
    const m = movementStats[0] || { movementCount: 0, netQuantityDelta: 0 };

    res.status(200).json({
        success: true,
        data: {
            userId,
            sales: {
                count: s.salesCount,
                unitsSold: s.unitsSold,
                totalRevenue: s.totalRevenue,
                totalProfit: s.totalProfit
            },
            purchaseOrders: {
                count: p.poCount,
                totalCost: p.totalCost
            },
            movements: {
                count: m.movementCount,
                netQuantityDelta: m.netQuantityDelta
            }
        }
    });
});

