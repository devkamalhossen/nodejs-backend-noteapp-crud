const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate, authorize('admin'));
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

// Aggregation Scenario Routes
router.get('/users/by-interests', adminController.groupByInterests); // Scenario 1
router.get('/users/:userId/posts', adminController.getUserPosts);    // Scenario 2

module.exports = router;