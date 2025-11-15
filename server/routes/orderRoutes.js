const express = require('express');
const {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  listOrders,
  listMyOrders,
  getOrderById,
  getTokenQRCode,
} = require('../controllers/orderController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authorize('student'), createOrder);
router.get('/my', authorize('student'), listMyOrders);
router.patch('/:id/cancel', authorize('student'), cancelOrder);
router.get('/:id/token', authorize('student', 'admin', 'super-admin'), getTokenQRCode);
router.get('/:id', authorize('student', 'admin', 'super-admin'), getOrderById);
router.patch('/:id/status', authorize('admin', 'super-admin'), updateOrderStatus);
router.get('/', authorize('admin', 'super-admin'), listOrders);

module.exports = router;
