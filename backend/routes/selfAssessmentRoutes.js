const express = require('express');
const router = express.Router();
const selfAssessmentController = require('../controllers/selfAssessmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/user/:userId', authMiddleware, selfAssessmentController.getSelfAssessment);
router.post('/user/:userId', authMiddleware, selfAssessmentController.createOrUpdateSelfAssessment);

module.exports = router;