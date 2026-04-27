const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMovements } = require('../controllers/movementController');

const router = express.Router();

router.use(protect);

router.get('/', getMovements);

module.exports = router;

