const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getSupplierLeadTimes } = require('../controllers/supplierAnalyticsController');
const { getProductSegmentation, getProductAnomalies } = require('../controllers/productAnalyticsController');
const { getMySummary, getMyActivityTrend } = require('../controllers/userAnalyticsController');

const router = express.Router();

router.use(protect);

router.get('/suppliers/lead-times', getSupplierLeadTimes);
router.get('/products/segmentation', getProductSegmentation);
router.get('/products/anomalies', getProductAnomalies);
router.get('/users/me/summary', getMySummary);
router.get('/users/me/activity-trend', getMyActivityTrend);

module.exports = router;
