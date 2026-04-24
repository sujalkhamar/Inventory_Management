const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = asyncHandler(async (req, res, next) => {
    const suppliers = await Supplier.find().sort('-createdAt');
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private/Admin
exports.createSupplier = asyncHandler(async (req, res, next) => {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
exports.updateSupplier = asyncHandler(async (req, res, next) => {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, data: supplier });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
exports.deleteSupplier = asyncHandler(async (req, res, next) => {
    await Supplier.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
});
