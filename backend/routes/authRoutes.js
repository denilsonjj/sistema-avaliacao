const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getAllUsers, updateUser, deleteUser, getUserById, updateUserProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.get('/users', protect, authorize('PMM', 'LÍDER'), getAllUsers);
router.route('/users/:id')
    .get(protect, authorize('PMM', 'LÍDER'), getUserById)
    .put(protect, authorize('PMM'), updateUser)
    .delete(protect, authorize('PMM'), deleteUser);

module.exports = router;