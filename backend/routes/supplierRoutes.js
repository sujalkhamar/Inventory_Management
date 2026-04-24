const express = require('express');
const { 
    getSuppliers, 
    createSupplier, 
    updateSupplier, 
    deleteSupplier 
} = require('../controllers/supplierController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getSuppliers)
    .post(authorize('admin'), createSupplier);

router.route('/:id')
    .put(authorize('admin'), updateSupplier)
    .delete(authorize('admin'), deleteSupplier);

module.exports = router;
