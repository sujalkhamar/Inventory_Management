const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const {
    getIntelligenceOverview,
    getProductIntelligence
} = require('../services/intelligenceService');

const parseLookbackDays = (queryValue) => {
    const days = parseInt(queryValue, 10);

    if (Number.isNaN(days) || days <= 0) {
        return 30;
    }

    return Math.min(days, 180);
};

// @desc    Get predictive inventory overview
// @route   GET /api/intelligence/overview
// @access  Private
exports.getOverview = asyncHandler(async (req, res, next) => {
    const lookbackDays = parseLookbackDays(req.query.days);
    const overview = await getIntelligenceOverview(lookbackDays);

    res.status(200).json({
        success: true,
        data: overview
    });
});

// @desc    Get predictive insights for a single product
// @route   GET /api/intelligence/products/:id
// @access  Private
exports.getProductInsights = asyncHandler(async (req, res, next) => {
    const lookbackDays = parseLookbackDays(req.query.days);
    const insights = await getProductIntelligence(req.params.id, lookbackDays);

    if (!insights) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: insights
    });
});
