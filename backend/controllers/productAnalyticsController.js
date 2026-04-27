const asyncHandler = require('../middleware/async');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

const clampInt = (value, fallback, min, max) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.max(min, Math.min(parsed, max));
};

const toISODateKey = (date) => new Date(date).toISOString().slice(0, 10);

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

const mean = (values) => (values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length);

const stddev = (values) => {
    if (values.length <= 1) return 0;
    const m = mean(values);
    const variance = values.reduce((acc, v) => acc + ((v - m) ** 2), 0) / values.length;
    return Math.sqrt(variance);
};

// @desc    ABC/XYZ segmentation for products
// @route   GET /api/analytics/products/segmentation
// @access  Private
//
// Query params:
// - days: revenue lookback window (default 90, max 365)
// - weeks: demand-variability window in weeks (default 12, max 52)
exports.getProductSegmentation = asyncHandler(async (req, res, next) => {
    const days = clampInt(req.query.days, 90, 7, 365);
    const weeks = clampInt(req.query.weeks, 12, 4, 52);

    const today = startOfDay(new Date());
    const revenueSince = addDays(today, -days);
    const demandSince = addDays(today, -(weeks * 7));

    const [revenueAgg, demandAgg] = await Promise.all([
        Sale.aggregate([
            { $match: { date: { $gte: revenueSince } } },
            {
                $group: {
                    _id: '$product',
                    revenue: { $sum: '$totalPrice' },
                    units: { $sum: '$quantity' }
                }
            }
        ]),
        Sale.aggregate([
            { $match: { date: { $gte: demandSince } } },
            {
                $project: {
                    product: 1,
                    quantity: 1,
                    weekKey: {
                        $dateToString: { format: '%G-%V', date: '$date' } // ISO week
                    }
                }
            },
            {
                $group: {
                    _id: { product: '$product', weekKey: '$weekKey' },
                    units: { $sum: '$quantity' }
                }
            }
        ])
    ]);

    const revenueByProduct = revenueAgg.reduce((acc, r) => {
        acc[r._id.toString()] = { revenue: r.revenue || 0, units: r.units || 0 };
        return acc;
    }, {});

    // Build weekly demand arrays per product for coefficient of variation
    const weeklyByProduct = demandAgg.reduce((acc, row) => {
        const productId = row._id.product.toString();
        if (!acc[productId]) acc[productId] = [];
        acc[productId].push(row.units || 0);
        return acc;
    }, {});

    const products = await Product.find().select('name category supplier stock lowStockThreshold');

    const rows = products.map((p) => {
        const productId = p._id.toString();
        const revenue = revenueByProduct[productId]?.revenue || 0;
        const units = revenueByProduct[productId]?.units || 0;

        const weekly = weeklyByProduct[productId] || [];
        const weeklyMean = mean(weekly);
        const weeklyStd = stddev(weekly);
        const cv = weeklyMean > 0 ? (weeklyStd / weeklyMean) : null;

        return {
            productId: p._id,
            name: p.name,
            category: p.category,
            supplier: p.supplier,
            stock: p.stock,
            lowStockThreshold: p.lowStockThreshold,
            revenue,
            units,
            demand: {
                weeks,
                weeklyMean: Number(weeklyMean.toFixed(3)),
                weeklyStd: Number(weeklyStd.toFixed(3)),
                coefficientOfVariation: cv === null ? null : Number(cv.toFixed(3))
            }
        };
    });

    // ABC: sort by revenue, cumulative share
    const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0) || 0;
    const sortedByRevenue = [...rows].sort((a, b) => b.revenue - a.revenue);

    let cumulative = 0;
    const abcMap = {};
    for (const r of sortedByRevenue) {
        const share = totalRevenue > 0 ? r.revenue / totalRevenue : 0;
        cumulative += share;

        let abc = 'C';
        if (cumulative <= 0.8) abc = 'A';
        else if (cumulative <= 0.95) abc = 'B';

        abcMap[r.productId.toString()] = { abc, revenueShare: share };
    }

    // XYZ: variability tiers based on coefficient of variation
    // X: stable (<= 0.5), Y: moderate (<= 1.0), Z: volatile (> 1.0), N: not enough demand
    const withSeg = rows.map((r) => {
        const cv = r.demand.coefficientOfVariation;
        let xyz = 'N';
        if (cv !== null) {
            if (cv <= 0.5) xyz = 'X';
            else if (cv <= 1.0) xyz = 'Y';
            else xyz = 'Z';
        }

        return {
            ...r,
            segmentation: {
                abc: abcMap[r.productId.toString()]?.abc || 'C',
                xyz,
                revenueShare: Number(((abcMap[r.productId.toString()]?.revenueShare || 0) * 100).toFixed(2))
            }
        };
    });

    const summary = withSeg.reduce((acc, r) => {
        const k = `${r.segmentation.abc}${r.segmentation.xyz}`;
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});

    res.status(200).json({
        success: true,
        data: {
            revenueLookbackDays: days,
            demandWindowWeeks: weeks,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            summary,
            products: withSeg
        }
    });
});

// @desc    Demand/stock anomaly detection
// @route   GET /api/analytics/products/anomalies
// @access  Private
//
// Query params:
// - spikeDays: recent window (default 7, max 30)
// - baselineDays: baseline window before spike window (default 28, max 180)
// - spikeFactor: multiplier threshold (default 2.5)
// - adjustAbs: manual adjustment absolute delta threshold (default 50)
exports.getProductAnomalies = asyncHandler(async (req, res, next) => {
    const spikeDays = clampInt(req.query.spikeDays, 7, 1, 30);
    const baselineDays = clampInt(req.query.baselineDays, 28, 7, 180);
    const spikeFactor = Number(req.query.spikeFactor || 2.5);
    const adjustAbs = clampInt(req.query.adjustAbs, 50, 1, 100000);

    const today = startOfDay(new Date());
    const spikeStart = addDays(today, -spikeDays);
    const baselineStart = addDays(today, -(spikeDays + baselineDays));

    const [spikeAgg, baselineAgg, products, adjustments] = await Promise.all([
        Sale.aggregate([
            { $match: { date: { $gte: spikeStart } } },
            { $group: { _id: '$product', units: { $sum: '$quantity' }, revenue: { $sum: '$totalPrice' } } }
        ]),
        Sale.aggregate([
            { $match: { date: { $gte: baselineStart, $lt: spikeStart } } },
            { $group: { _id: '$product', units: { $sum: '$quantity' }, revenue: { $sum: '$totalPrice' } } }
        ]),
        Product.find().select('name category supplier stock lowStockThreshold'),
        InventoryMovement.find({
            reason: 'manual_adjustment',
            createdAt: { $gte: baselineStart }
        }).select('product quantityDelta note createdAt createdBy').populate('createdBy', 'name email')
    ]);

    const spikeMap = spikeAgg.reduce((acc, r) => {
        acc[r._id.toString()] = { units: r.units || 0, revenue: r.revenue || 0 };
        return acc;
    }, {});
    const baselineMap = baselineAgg.reduce((acc, r) => {
        acc[r._id.toString()] = { units: r.units || 0, revenue: r.revenue || 0 };
        return acc;
    }, {});

    const adjustmentByProduct = adjustments.reduce((acc, m) => {
        const id = m.product.toString();
        if (!acc[id]) acc[id] = [];
        if (Math.abs(m.quantityDelta) >= adjustAbs) {
            acc[id].push({
                movementId: m._id,
                quantityDelta: m.quantityDelta,
                note: m.note,
                createdAt: m.createdAt,
                createdBy: m.createdBy
            });
        }
        return acc;
    }, {});

    const anomalies = [];

    for (const p of products) {
        const id = p._id.toString();
        const spikeUnits = spikeMap[id]?.units || 0;
        const baselineUnits = baselineMap[id]?.units || 0;

        const spikeRate = spikeUnits / spikeDays;
        const baselineRate = baselineUnits / baselineDays;

        const hasSpike = baselineRate > 0 && spikeRate >= baselineRate * spikeFactor;
        const lowStock = p.stock <= p.lowStockThreshold;
        const stockout = p.stock <= 0 && spikeUnits > 0;
        const bigAdjustments = adjustmentByProduct[id] || [];

        if (!hasSpike && !lowStock && !stockout && bigAdjustments.length === 0) {
            continue;
        }

        anomalies.push({
            productId: p._id,
            name: p.name,
            category: p.category,
            supplier: p.supplier,
            stock: p.stock,
            lowStockThreshold: p.lowStockThreshold,
            demand: {
                spikeDays,
                baselineDays,
                spikeUnits,
                baselineUnits,
                spikePerDay: Number(spikeRate.toFixed(3)),
                baselinePerDay: Number(baselineRate.toFixed(3)),
                spikeFactor: baselineRate > 0 ? Number((spikeRate / baselineRate).toFixed(2)) : null
            },
            flags: {
                demandSpike: hasSpike,
                lowStock,
                stockout,
                largeManualAdjustments: bigAdjustments.length > 0
            },
            largeManualAdjustments: bigAdjustments
        });
    }

    anomalies.sort((a, b) => {
        const bScore = (b.flags.stockout ? 3 : 0) + (b.flags.lowStock ? 2 : 0) + (b.flags.demandSpike ? 1 : 0);
        const aScore = (a.flags.stockout ? 3 : 0) + (a.flags.lowStock ? 2 : 0) + (a.flags.demandSpike ? 1 : 0);
        return bScore - aScore;
    });

    res.status(200).json({
        success: true,
        data: {
            spikeDays,
            baselineDays,
            spikeFactor,
            adjustAbs,
            count: anomalies.length,
            anomalies
        }
    });
});

