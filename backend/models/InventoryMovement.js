const mongoose = require('mongoose');

const InventoryMovementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    warehouse: {
        type: mongoose.Schema.ObjectId,
        ref: 'Warehouse',
        default: null
    },
    quantityDelta: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        enum: [
            'sale',
            'purchase_order_received',
            'manual_adjustment',
            'import',
            'other'
        ],
        default: 'other'
    },
    sourceRef: {
        type: mongoose.Schema.ObjectId,
        default: null
    },
    sourceModel: {
        type: String,
        enum: ['Sale', 'PurchaseOrder', 'Product', 'Other', null],
        default: null
    },
    note: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InventoryMovement', InventoryMovementSchema);

