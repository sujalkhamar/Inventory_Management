const asyncHandler = require('../middleware/async');
const Activity = require('../models/Activity');

// @desc    Get activities for the current user
// @route   GET /api/activities/me
// @access  Private
exports.getMyActivities = asyncHandler(async (req, res, next) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const activities = await Activity.find({ user: req.user.id })
        .populate('user', 'name')
        .sort('-createdAt')
        .limit(limit);

    res.status(200).json({
        success: true,
        data: activities
    });
});

