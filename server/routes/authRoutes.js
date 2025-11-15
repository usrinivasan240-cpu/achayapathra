const express = require('express');
const { signup, login, adminLogin, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/logout', authenticate(), logout);

module.exports = router;
