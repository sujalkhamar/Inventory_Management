const express = require('express');
const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/authMiddleware');
const { getMyActivities } = require('../controllers/activityController');

const router = express.Router();

router.use(protect);

router.get('/me', getMyActivities);

// @desc    Get activities for a specific reference (product/user)
// @route   GET /api/activities/ref/:id
router.get('/ref/:id', asyncHandler(async (req, res, next) => {
    const activities = await Activity.find({ referenceId: req.params.id })
        .populate('user', 'name')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        data: activities
    });
}));

module.exports = router;
