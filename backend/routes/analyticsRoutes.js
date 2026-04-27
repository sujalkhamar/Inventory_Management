const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getSupplierLeadTimes } = require('../controllers/supplierAnalyticsController');

const router = express.Router();

router.use(protect);

router.get('/suppliers/lead-times', getSupplierLeadTimes);

module.exports = router;

