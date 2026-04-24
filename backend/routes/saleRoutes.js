const express = require('express');
const {
    getSales,
    createSale,
    getAnalytics
} = require('../controllers/saleController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, getAnalytics);

router
    .route('/')
    .get(protect, getSales)
    .post(protect, createSale);

module.exports = router;
