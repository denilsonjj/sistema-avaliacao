const express = require('express');
const router = express.Router();
const oeeController = require('../controllers/oeeController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/user/:userId', authMiddleware, oeeController.getOeeForUser);
// Adicionar em backend/routes/oeeRoutes.js
router.get('/lines/overview', authMiddleware, oeeController.getOeeOverviewForAllLines);
module.exports = router;