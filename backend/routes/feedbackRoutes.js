const express = require('express');
const router = express.Router();
const { createFeedback, getReceivedFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createFeedback);
router.get('/received', protect, getReceivedFeedback);

module.exports = router;