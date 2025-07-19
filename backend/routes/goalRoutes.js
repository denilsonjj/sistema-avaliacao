// backend/routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, goalController.createGoal);
router.get('/user/:userId', authMiddleware, goalController.getGoalsForUser);
router.put('/:id/status', authMiddleware, goalController.updateGoalStatus);

module.exports = router;