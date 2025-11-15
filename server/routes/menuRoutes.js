const express = require('express');
const {
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require('../controllers/menuController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listMenuItems);
router.post('/add', authorize('admin', 'super-admin'), createMenuItem);
router.put('/:id', authorize('admin', 'super-admin'), updateMenuItem);
router.delete('/:id', authorize('admin', 'super-admin'), deleteMenuItem);
router.patch('/:id/availability', authorize('admin', 'super-admin'), toggleAvailability);

module.exports = router;
