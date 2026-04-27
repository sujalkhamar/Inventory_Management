const Product = require('../models/Product');
const Sale = require('../models/Sale');
const PurchaseOrder = require('../models/PurchaseOrder');

const roundTo = (value, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
};

const startOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getDateRange = (days) => {
    const today = startOfDay(new Date());
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (days - 1));

    return { today, rangeStart };
};

const getSalesMap = async (days) => {
    const { rangeStart } = getDateRange(days);

    const sales = await Sale.aggregate([
        {
            $match: {
                date: { $gte: rangeStart }
            }
        },
        {
            $group: {
                _id: '$product',
                totalQuantity: { $sum: '$quantity' },
                activeDays: {
                    $addToSet: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' }
                    }
                }
            }
        }
    ]);

    return sales.reduce((map, item) => {
        map[item._id.toString()] = {
            totalQuantity: item.totalQuantity,
            activeDays: item.activeDays.length
        };
        return map;
    }, {});
};

const getOpenPurchaseOrdersMap = async () => {
    const orders = await PurchaseOrder.find({
        status: { $in: ['Pending', 'Shipped'] }
    }).select('items status createdAt');

    return orders.reduce((map, order) => {
        order.items.forEach((item) => {
            if (!item.product) {
                return;
            }

            const productId = item.product.toString();
            if (!map[productId]) {
                map[productId] = {
                    quantity: 0,
                    oldestOpenOrderAt: order.createdAt
                };
            }

            map[productId].quantity += item.quantity || 0;
            if (order.createdAt < map[productId].oldestOpenOrderAt) {
                map[productId].oldestOpenOrderAt = order.createdAt;
            }
        });

        return map;
    }, {});
};

const buildProductIntelligence = (product, salesInfo, openOrderInfo, lookbackDays) => {
    const totalSold = salesInfo?.totalQuantity || 0;
    const activeDays = salesInfo?.activeDays || 0;
    const averageDailyDemand = totalSold > 0 ? totalSold / lookbackDays : 0;
    const activeDayDemand = activeDays > 0 ? totalSold / activeDays : 0;
    const currentStock = product.stock || 0;
    const lowStockThreshold = product.lowStockThreshold || 0;
    const incomingStock = openOrderInfo?.quantity || 0;

    const daysUntilStockout = averageDailyDemand > 0
        ? roundTo(currentStock / averageDailyDemand, 1)
        : null;

    const reorderPoint = Math.max(
        lowStockThreshold,
        Math.ceil((averageDailyDemand * 7) + lowStockThreshold)
    );

    const recommendedReorderQuantity = Math.max(
        0,
        Math.ceil((averageDailyDemand * 14) + lowStockThreshold - currentStock - incomingStock)
    );

    let alertLevel = 'healthy';
    if (currentStock <= lowStockThreshold) {
        alertLevel = 'critical';
    } else if (daysUntilStockout !== null && daysUntilStockout <= 7) {
        alertLevel = 'warning';
    } else if (daysUntilStockout !== null && daysUntilStockout <= 14) {
        alertLevel = 'watch';
    }

    return {
        productId: product._id,
        name: product.name,
        category: product.category,
        supplier: product.supplier,
        stock: currentStock,
        lowStockThreshold,
        forecast: {
            lookbackDays,
            totalUnitsSold: totalSold,
            averageDailyDemand: roundTo(averageDailyDemand),
            activeDayDemand: roundTo(activeDayDemand),
            projected7DayDemand: Math.ceil(averageDailyDemand * 7),
            projected14DayDemand: Math.ceil(averageDailyDemand * 14),
            daysUntilStockout
        },
        alert: {
            level: alertLevel,
            stockoutRisk: daysUntilStockout !== null && daysUntilStockout <= 14,
            message: daysUntilStockout === null
                ? 'Not enough recent sales history for a stockout prediction yet.'
                : `Projected stock coverage is about ${daysUntilStockout} days at the current demand rate.`
        },
        restock: {
            incomingStock,
            reorderPoint,
            recommendedQuantity: recommendedReorderQuantity,
            shouldReorder: recommendedReorderQuantity > 0 || currentStock <= reorderPoint
        }
    };
};

const getIntelligenceOverview = async (lookbackDays = 30) => {
    const [products, salesMap, openOrdersMap] = await Promise.all([
        Product.find().sort('name'),
        getSalesMap(lookbackDays),
        getOpenPurchaseOrdersMap()
    ]);

    const items = products.map((product) => buildProductIntelligence(
        product,
        salesMap[product._id.toString()],
        openOrdersMap[product._id.toString()],
        lookbackDays
    ));

    const flaggedProducts = items.filter((item) => item.alert.level !== 'healthy');
    const reorderRecommendations = items
        .filter((item) => item.restock.shouldReorder)
        .sort((a, b) => b.restock.recommendedQuantity - a.restock.recommendedQuantity);

    return {
        summary: {
            totalProducts: items.length,
            productsWithForecast: items.filter((item) => item.forecast.totalUnitsSold > 0).length,
            criticalAlerts: items.filter((item) => item.alert.level === 'critical').length,
            warningAlerts: items.filter((item) => item.alert.level === 'warning').length,
            watchAlerts: items.filter((item) => item.alert.level === 'watch').length,
            reorderCandidates: reorderRecommendations.length
        },
        flaggedProducts,
        reorderRecommendations,
        products: items
    };
};

const getProductIntelligence = async (productId, lookbackDays = 30) => {
    const [product, salesMap, openOrdersMap] = await Promise.all([
        Product.findById(productId),
        getSalesMap(lookbackDays),
        getOpenPurchaseOrdersMap()
    ]);

    if (!product) {
        return null;
    }

    return buildProductIntelligence(
        product,
        salesMap[product._id.toString()],
        openOrdersMap[product._id.toString()],
        lookbackDays
    );
};

module.exports = {
    getIntelligenceOverview,
    getProductIntelligence
};
