const express = require('express');
const { 
    getWarehouses, 
    createWarehouse, 
    updateWarehouse, 
    deleteWarehouse 
} = require('../controllers/warehouseController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getWarehouses)
    .post(authorize('admin'), createWarehouse);

router.route('/:id')
    .put(authorize('admin'), updateWarehouse)
    .delete(authorize('admin'), deleteWarehouse);

module.exports = router;
