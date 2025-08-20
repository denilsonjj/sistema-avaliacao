const express = require('express');
const router = express.Router();
const { getProductionLines, assignUserToLines } = require('../controllers/productionLineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getProductionLines);
router.post('/assign', protect, authorize('PMM'), assignUserToLines);

module.exports = router;