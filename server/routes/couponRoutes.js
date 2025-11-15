const express = require('express');
const { validateCoupon } = require('../controllers/couponController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/validate', authorize('student', 'admin', 'super-admin'), validateCoupon);

module.exports = router;
