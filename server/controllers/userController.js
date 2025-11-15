const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const ActivityLog = require('../models/ActivityLog');
const { fetchUserNotifications } = require('../services/notificationService');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  return res.json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatarUrl } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatarUrl) user.avatarUrl = avatarUrl;

  await user.save();

  await ActivityLog.create({
    actor: req.user.id,
    actorModel: 'User',
    action: 'user.updateProfile',
    context: { userId: user._id },
  });

  return res.json({ success: true, user: { ...user.toObject(), password: undefined } });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const { menuItemId } = req.body;
  if (!menuItemId) {
    return res.status(400).json({ success: false, message: 'menuItemId is required' });
  }

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  const user = await User.findById(req.user.id);
  const isFavorite = user.favorites.some((fav) => fav.toString() === menuItemId);

  if (isFavorite) {
    user.favorites = user.favorites.filter((fav) => fav.toString() !== menuItemId);
  } else {
    user.favorites.push(menuItemId);
  }

  await user.save();

  const favorites = user.favorites.map((fav) => fav.toString());

  return res.json({ success: true, favorites, isFavorite: !isFavorite });
});

const listFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('favorites');
  return res.json({ success: true, favorites: user.favorites });
});

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = fetchUserNotifications(req.user.id);
  return res.json({ success: true, notifications });
});

module.exports = {
  getProfile,
  updateProfile,
  toggleFavorite,
  listFavorites,
  listNotifications,
};
