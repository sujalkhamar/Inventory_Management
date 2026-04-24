const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });

const router = express.Router();

router.post('/import', protect, authorize('admin'), upload.single('file'), importProducts);

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
