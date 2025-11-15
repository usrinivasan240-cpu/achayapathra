const asyncHandler = require('../utils/asyncHandler');
const Canteen = require('../models/Canteen');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const { signToken } = require('../utils/jwt');

const createCanteen = asyncHandler(async (req, res) => {
  const { name, code, location, description, counters } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Canteen name and code are required' });
  }

  const existing = await Canteen.findOne({ code });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Canteen code already exists' });
  }

  const canteen = await Canteen.create({ name, code, location, description, counters });

  await ActivityLog.create({
    actor: req.user.id,
    actorModel: 'Admin',
    action: 'canteen.create',
    context: { canteenId: canteen._id },
  });

  return res.status(201).json({ success: true, canteen });
});

const listCanteens = asyncHandler(async (req, res) => {
  const canteens = await Canteen.find().sort({ name: 1 });
  return res.json({ success: true, canteens });
});

const addAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, canteens, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Admin with this email already exists' });
  }

  const admin = await Admin.create({ name, email, password, role: role || 'admin', canteens });
  const token = signToken({ id: admin._id, role: admin.role, canteen: admin.canteens });

  await ActivityLog.create({
    actor: req.user.id,
    actorModel: 'Admin',
    action: 'admin.create',
    context: { adminId: admin._id },
  });

  return res.status(201).json({ success: true, admin, token });
});

const removeAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );

  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  await ActivityLog.create({
    actor: req.user.id,
    actorModel: 'Admin',
    action: 'admin.deactivate',
    context: { adminId: admin._id },
  });

  return res.json({ success: true, admin });
});

const listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().populate('canteens', 'name code');
  return res.json({ success: true, admins });
});

const activityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit) || 200);
  return res.json({ success: true, logs });
});

module.exports = {
  createCanteen,
  listCanteens,
  addAdmin,
  removeAdmin,
  listAdmins,
  activityLogs,
};
