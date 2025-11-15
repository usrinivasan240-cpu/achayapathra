const express = require('express');
const { createReview, listReviews } = require('../controllers/reviewController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listReviews);
router.post('/', authorize('student'), createReview);

module.exports = router;
