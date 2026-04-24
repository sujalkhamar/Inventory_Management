const express = require('express');
const {
    getUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers);
router.route('/:id/role').put(updateUserRole);
router.route('/:id').delete(deleteUser);

module.exports = router;
