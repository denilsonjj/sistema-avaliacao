const express = require('express');
const router = express.Router();
const { createGoal, getGoalsByUserId, updateGoalStatus } = require('../controllers/goalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('PMM', 'LÍDER'), createGoal);
router.get('/user/:userId', protect, getGoalsByUserId);
router.put('/:id', protect, updateGoalStatus);

module.exports = router;