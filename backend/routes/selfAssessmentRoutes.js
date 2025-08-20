const express = require('express');
const router = express.Router();
const { upsertSelfAssessment, getSelfAssessment } = require('../controllers/selfAssessmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, upsertSelfAssessment);
router.get('/', protect, getSelfAssessment);
router.get('/:userId', protect, authorize('PMM', 'LÍDER'), getSelfAssessment);

module.exports = router;