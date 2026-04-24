const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Warehouse = require('../models/Warehouse');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getWarehouses = asyncHandler(async (req, res, next) => {
    const warehouses = await Warehouse.find().sort('-createdAt');
    res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
});

// @desc    Create warehouse
// @route   POST /api/warehouses
// @access  Private/Admin
exports.createWarehouse = asyncHandler(async (req, res, next) => {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ success: true, data: warehouse });
});

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private/Admin
exports.updateWarehouse = asyncHandler(async (req, res, next) => {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, data: warehouse });
});

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private/Admin
exports.deleteWarehouse = asyncHandler(async (req, res, next) => {
    await Warehouse.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
});
