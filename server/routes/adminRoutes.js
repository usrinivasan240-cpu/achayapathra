const express = require('express');
const {
  createCanteen,
  listCanteens,
  addAdmin,
  removeAdmin,
  listAdmins,
  activityLogs,
} = require('../controllers/adminController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/canteens', authorize('super-admin'), createCanteen);
router.get('/canteens', authorize('admin', 'super-admin'), listCanteens);
router.post('/admins', authorize('super-admin'), addAdmin);
router.delete('/admins/:id', authorize('super-admin'), removeAdmin);
router.get('/admins', authorize('super-admin'), listAdmins);
router.get('/activity-logs', authorize('super-admin'), activityLogs);

module.exports = router;
