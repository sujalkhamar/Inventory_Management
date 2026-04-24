const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    supplier: {
        type: mongoose.Schema.ObjectId,
        ref: 'Supplier',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        },
        quantity: Number,
        costPrice: Number
    }],
    totalCost: Number,
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Received', 'Cancelled'],
        default: 'Pending'
    },
    warehouse: {
        type: mongoose.Schema.ObjectId,
        ref: 'Warehouse'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
