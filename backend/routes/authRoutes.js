// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.getAllUsers);
router.get('/users/:id', authMiddleware, authController.getUserById);
router.delete('/users/:id', authMiddleware, authController.deleteUser);
router.put('/profile', authMiddleware, authController.updateUserProfile);
router.get('/users/stats/by-role', authMiddleware, authController.getUserStatsByRole);
module.exports = router;