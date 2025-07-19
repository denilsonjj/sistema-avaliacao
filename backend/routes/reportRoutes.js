// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/evaluations-over-time', authMiddleware, reportController.getEvaluationsOverTime);
router.get('/export/evaluations', authMiddleware, reportController.exportEvaluations);

module.exports = router;