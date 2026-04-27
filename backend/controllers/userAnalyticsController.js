const asyncHandler = require('../middleware/async');
const Sale = require('../models/Sale');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryMovement = require('../models/InventoryMovement');
const Activity = require('../models/Activity');

const clampInt = (value, fallback, min, max) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.max(min, Math.min(parsed, max));
};

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

// @desc    Current user impact summary
// @route   GET /api/analytics/users/me/summary
// @access  Private
exports.getMySummary = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const days = clampInt(req.query.days, 30, 1, 365);
    const since = addDays(startOfDay(new Date()), -days);

    const [
        saleStats,
        poStats,
        movementStats,
        poStatusAgg
    ] = await Promise.all([
        Sale.aggregate([
            { $match: { soldBy: req.user._id, date: { $gte: since } } },
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
            { $match: { createdBy: req.user._id, createdAt: { $gte: since } } },
            {
                $group: {
                    _id: null,
                    poCount: { $sum: 1 },
                    totalCost: { $sum: '$totalCost' }
                }
            }
        ]),
        InventoryMovement.aggregate([
            { $match: { createdBy: req.user._id, createdAt: { $gte: since } } },
            {
                $group: {
                    _id: null,
                    movementCount: { $sum: 1 },
                    netQuantityDelta: { $sum: '$quantityDelta' }
                }
            }
        ]),
        PurchaseOrder.aggregate([
            { $match: { createdBy: req.user._id, createdAt: { $gte: since } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
    ]);

    const s = saleStats[0] || { salesCount: 0, unitsSold: 0, totalRevenue: 0, totalProfit: 0 };
    const p = poStats[0] || { poCount: 0, totalCost: 0 };
    const m = movementStats[0] || { movementCount: 0, netQuantityDelta: 0 };
    const poStatusCounts = poStatusAgg.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
    }, {});

    res.status(200).json({
        success: true,
        data: {
            userId,
            days,
            sales: {
                count: s.salesCount,
                unitsSold: s.unitsSold,
                totalRevenue: s.totalRevenue,
                totalProfit: s.totalProfit
            },
            purchaseOrders: {
                count: p.poCount,
                totalCost: p.totalCost,
                byStatus: poStatusCounts
            },
            movements: {
                count: m.movementCount,
                netQuantityDelta: m.netQuantityDelta
            }
        }
    });
});

// @desc    Current user activity trend
// @route   GET /api/analytics/users/me/activity-trend
// @access  Private
exports.getMyActivityTrend = asyncHandler(async (req, res, next) => {
    const days = clampInt(req.query.days, 30, 1, 180);
    const since = addDays(startOfDay(new Date()), -days);

    const trend = await Activity.aggregate([
        { $match: { user: req.user._id, createdAt: { $gte: since } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Fill missing dates with 0 so charts look consistent
    const map = trend.reduce((acc, r) => {
        acc[r._id] = r.count;
        return acc;
    }, {});

    const out = [];
    const today = startOfDay(new Date());
    for (let i = days - 1; i >= 0; i--) {
        const d = addDays(today, -i);
        const key = d.toISOString().slice(0, 10);
        out.push({ date: key, count: map[key] || 0 });
    }

    res.status(200).json({
        success: true,
        data: { days, trend: out }
    });
});
