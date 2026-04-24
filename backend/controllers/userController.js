const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    user.role = req.body.role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        data: {}
    });
});
