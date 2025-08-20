const express = require('express');
const router = express.Router();
const { createEvaluation, getAllEvaluations, getEvaluationsByUserId } = require('../controllers/evaluationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('PMM', 'LÍDER'), getAllEvaluations);
router.post('/', protect, authorize('PMM', 'LÍDER'), createEvaluation);
router.get('/user/:userId', protect, getEvaluationsByUserId);

module.exports = router;