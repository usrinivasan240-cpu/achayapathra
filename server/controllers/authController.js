const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const User = require('../models/User');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');

const sanitizeEntity = (entity) => {
  const { password, __v, ...rest } = entity.toObject();
  return rest;
};

const attachTokenCookie = (res, token) => {
  const cookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || 'sp_access_token';
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Account already exists for this email' });
  }

  const user = await User.create({ name, email, phone, password });
  const token = signToken({ id: user._id, role: user.role });

  attachTokenCookie(res, token);

  await ActivityLog.create({
    actor: user._id,
    actorModel: 'User',
    action: 'user.signup',
    context: { email },
  });

  return res.status(201).json({
    success: true,
    token,
    user: sanitizeEntity(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ id: user._id, role: user.role });
  attachTokenCookie(res, token);

  await ActivityLog.create({
    actor: user._id,
    actorModel: 'User',
    action: 'user.login',
    context: { email },
  });

  return res.json({ success: true, token, user: sanitizeEntity(user) });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const admin = await Admin.findOne({ email });

  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  if (!admin.isActive) {
    return res.status(403).json({ success: false, message: 'Admin account is inactive' });
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signToken({ id: admin._id, role: admin.role, canteen: admin.canteens });
  attachTokenCookie(res, token);

  await ActivityLog.create({
    actor: admin._id,
    actorModel: 'Admin',
    action: 'admin.login',
    context: { email },
  });

  return res.json({ success: true, token, admin: sanitizeEntity(admin) });
});

const logout = asyncHandler(async (req, res) => {
  const cookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || 'sp_access_token';
  res.clearCookie(cookieName);
  return res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
  signup,
  login,
  adminLogin,
  logout,
};
