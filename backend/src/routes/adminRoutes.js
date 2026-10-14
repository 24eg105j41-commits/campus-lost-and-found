const express = require('express');
const { getStats, getAllUsers, getAllClaims, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Require authenticated admin role for all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/claims', getAllClaims);

module.exports = router;
