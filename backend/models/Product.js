const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be negative']
    },
    price: {
        type: Number,
        required: [true, 'Please add a selling price']
    },
    costPrice: {
        type: Number,
        required: [true, 'Please add a cost price']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    supplier: {
        type: String,
        required: [true, 'Please add a supplier']
    },
    warehouse: {
        type: mongoose.Schema.ObjectId,
        ref: 'Warehouse'
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    location: {
        type: String,
        default: 'Main Warehouse'
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
