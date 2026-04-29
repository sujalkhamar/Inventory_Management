const Product = require('../models/Product');
const Sale = require('../models/Sale');
const PurchaseOrder = require('../models/PurchaseOrder');
const axios = require('axios');
const mongoose = require('mongoose');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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

const getMLDemandPrediction = async (productId, historicalSales) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
            product_id: productId.toString(),
            historical_sales: historicalSales
        });
        return response.data;
    } catch (error) {
        console.error('ML Prediction Error:', error.message);
        return null;
    }
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

const buildProductIntelligence = async (product, salesInfo, openOrderInfo, lookbackDays, historicalSales = []) => {
    const totalSold = salesInfo?.totalQuantity || 0;
    const activeDays = salesInfo?.activeDays || 0;
    const averageDailyDemand = totalSold > 0 ? totalSold / lookbackDays : 0;
    
    // AI Prediction
    let aiPrediction = null;
    if (historicalSales.length > 0) {
        aiPrediction = await getMLDemandPrediction(product._id, historicalSales);
    }

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
            aiPredictedDemand: aiPrediction ? roundTo(aiPrediction.predicted_demand) : null,
            aiConfidence: aiPrediction ? roundTo(aiPrediction.confidence_score) : 0,
            projected7DayDemand: aiPrediction ? Math.ceil(aiPrediction.predicted_demand * 7) : Math.ceil(averageDailyDemand * 7),
            projected14DayDemand: aiPrediction ? Math.ceil(aiPrediction.predicted_demand * 14) : Math.ceil(averageDailyDemand * 14),
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

const getHistoricalSalesMap = async (days) => {
    const { rangeStart } = getDateRange(days);
    const sales = await Sale.aggregate([
        { $match: { date: { $gte: rangeStart } } },
        {
            $group: {
                _id: {
                    product: '$product',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
                },
                quantity: { $sum: '$quantity' }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    return sales.reduce((map, item) => {
        const productId = item._id.product.toString();
        if (!map[productId]) map[productId] = [];
        map[productId].push(item.quantity);
        return map;
    }, {});
};

const getIntelligenceOverview = async (lookbackDays = 30) => {
    const [products, salesMap, openOrdersMap, historicalSalesMap] = await Promise.all([
        Product.find().sort('name'),
        getSalesMap(lookbackDays),
        getOpenPurchaseOrdersMap(),
        getHistoricalSalesMap(lookbackDays)
    ]);

    const items = await Promise.all(products.map((product) => buildProductIntelligence(
        product,
        salesMap[product._id.toString()],
        openOrdersMap[product._id.toString()],
        lookbackDays,
        historicalSalesMap[product._id.toString()] || []
    )));

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
    const { rangeStart } = getDateRange(lookbackDays);
    const [product, salesMap, openOrdersMap, historicalSales] = await Promise.all([
        Product.findById(productId),
        getSalesMap(lookbackDays),
        getOpenPurchaseOrdersMap(),
        Sale.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), date: { $gte: rangeStart } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    quantity: { $sum: '$quantity' }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);

    if (!product) {
        return null;
    }

    const salesList = historicalSales.map(s => s.quantity);

    return buildProductIntelligence(
        product,
        salesMap[product._id.toString()],
        openOrdersMap[product._id.toString()],
        lookbackDays,
        salesList
    );
};

module.exports = {
    getIntelligenceOverview,
    getProductIntelligence
};
