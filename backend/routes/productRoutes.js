const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(protect, getProducts)
    .post(protect, createProduct);

router
    .route('/:id')
    .get(protect, getProduct)
    .put(protect, updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
