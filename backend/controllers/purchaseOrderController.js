const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const logActivity = require('../utils/logger');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPurchaseOrders = asyncHandler(async (req, res, next) => {
    const orders = await PurchaseOrder.find()
        .populate('supplier', 'name')
        .populate('warehouse', 'name location')
        .populate('createdBy', 'name')
        .populate('items.product', 'name')
        .sort('-createdAt');

    res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private/Admin
exports.createPurchaseOrder = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user.id;
    req.body.orderId = 'PO-' + Date.now().toString(36).toUpperCase();

    // Calculate total cost
    let totalCost = 0;
    for (const item of req.body.items) {
        totalCost += item.quantity * item.costPrice;
    }
    req.body.totalCost = totalCost;

    const order = await PurchaseOrder.create(req.body);

    await logActivity(req.user.id, 'PO Created', `Purchase Order ${order.orderId} created for $${totalCost.toFixed(2)}`);

    res.status(201).json({ success: true, data: order });
});

// @desc    Update PO status
// @route   PUT /api/purchase-orders/:id/status
// @access  Private/Admin
exports.updatePOStatus = asyncHandler(async (req, res, next) => {
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
        return next(new ErrorResponse('Purchase order not found', 404));
    }

    const newStatus = req.body.status;

    // Track lifecycle timestamps for lead-time analytics
    if (newStatus === 'Shipped' && order.status !== 'Shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
    }
    if (newStatus === 'Received' && order.status !== 'Received' && !order.receivedAt) {
        order.receivedAt = new Date();
    }
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled' && !order.cancelledAt) {
        order.cancelledAt = new Date();
    }

    // If marking as "Received", automatically add stock to products
    if (newStatus === 'Received' && order.status !== 'Received') {
        for (const item of order.items) {
            const updatedProduct = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { new: true }
            );

            // Record inventory movement (ledger)
            try {
                await InventoryMovement.create({
                    product: item.product,
                    warehouse: order.warehouse || updatedProduct?.warehouse || null,
                    quantityDelta: Math.abs(item.quantity || 0),
                    reason: 'purchase_order_received',
                    sourceRef: order._id,
                    sourceModel: 'PurchaseOrder',
                    note: `Received ${item.quantity} unit(s) from PO ${order.orderId}`,
                    createdBy: req.user?.id || null
                });
            } catch (err) {
                console.error('Error creating inventory movement for PO receive:', err);
            }
        }

        await logActivity(
            req.user.id,
            'Stock Received',
            `PO ${order.orderId} received - stock updated for ${order.items.length} products`
        );
    }

    order.status = newStatus;
    await order.save();

    res.status(200).json({ success: true, data: order });
});

// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Private/Admin
exports.deletePurchaseOrder = asyncHandler(async (req, res, next) => {
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
});
