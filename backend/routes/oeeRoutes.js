const express = require('express');
const router = express.Router();
const { getOeeOverviewForAllLines, getOeeDataForUser, exportOeeOverview } = require('../controllers/oeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/overview-all-lines', protect, authorize('PMM', 'LÍDER'), getOeeOverviewForAllLines);
router.get('/user/:userId', protect, getOeeDataForUser);
router.get('/export', protect, authorize('PMM'), exportOeeOverview);

module.exports = router;