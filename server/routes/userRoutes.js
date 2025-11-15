const express = require('express');
const {
  getProfile,
  updateProfile,
  toggleFavorite,
  listFavorites,
  listNotifications,
} = require('../controllers/userController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authorize('student', 'admin', 'super-admin'), getProfile);
router.put('/me', authorize('student', 'admin', 'super-admin'), updateProfile);
router.post('/favorites', authorize('student'), toggleFavorite);
router.get('/favorites', authorize('student'), listFavorites);
router.get('/notifications', authorize('student'), listNotifications);

module.exports = router;
