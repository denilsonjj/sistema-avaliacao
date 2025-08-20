const express = require('express');
const router = express.Router();
const { exportReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/export/:type', protect, authorize('PMM'), exportReport);

module.exports = router;