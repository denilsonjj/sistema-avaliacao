const express = require('express');
const router = express.Router();
const oeeController = require('../controllers/oeeController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/user/:userId', authMiddleware, oeeController.getOeeForUser);

module.exports = router;