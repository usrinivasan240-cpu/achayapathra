const express = require('express');
const { dailySalesReport, platformRevenue } = require('../controllers/reportController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/daily', authorize('admin', 'super-admin'), dailySalesReport);
router.get('/platform', authorize('super-admin'), platformRevenue);

module.exports = router;
