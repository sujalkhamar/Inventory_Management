const express = require('express');
const {
    getPurchaseOrders,
    createPurchaseOrder,
    updatePOStatus,
    deletePurchaseOrder
} = require('../controllers/purchaseOrderController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getPurchaseOrders)
    .post(authorize('admin'), createPurchaseOrder);

router.route('/:id/status')
    .put(authorize('admin'), updatePOStatus);

router.route('/:id')
    .delete(authorize('admin'), deletePurchaseOrder);

module.exports = router;
