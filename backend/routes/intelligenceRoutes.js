const express = require('express');
const {
    getOverview,
    getProductInsights
} = require('../controllers/intelligenceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/products/:id', getProductInsights);

module.exports = router;
