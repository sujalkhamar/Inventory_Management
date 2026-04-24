const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a warehouse name'],
        unique: true
    },
    location: {
        type: String,
        required: [true, 'Please add a city/location']
    },
    manager: String,
    capacity: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Warehouse', WarehouseSchema);
