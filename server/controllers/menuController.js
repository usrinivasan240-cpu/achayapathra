const asyncHandler = require('../utils/asyncHandler');
const MenuItem = require('../models/MenuItem');
const ActivityLog = require('../models/ActivityLog');

const getCanteenFromRequest = (req) => req.body.canteen || req.query.canteen || req.user?.canteen;

const listMenuItems = asyncHandler(async (req, res) => {
  const canteen = getCanteenFromRequest(req);
  const filters = {};
  if (canteen) {
    filters.canteen = canteen;
  }
  if (req.query.category) {
    filters.category = req.query.category;
  }
  if (req.query.isAvailable) {
    filters.isAvailable = req.query.isAvailable === 'true';
  }

  const items = await MenuItem.find(filters).sort({ createdAt: -1 });
  return res.json({ success: true, items });
});

const createMenuItem = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    type: req.body.type,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
    ingredients: req.body.ingredients || [],
    canteen: req.body.canteen || req.user?.canteen,
    createdBy: req.user?.id,
  };

  if (!payload.name || !payload.price || !payload.canteen) {
    return res.status(400).json({ success: false, message: 'Name, price and canteen are required' });
  }

  const menuItem = await MenuItem.create(payload);

  await ActivityLog.create({
    actor: req.user?.id,
    actorModel: 'Admin',
    action: 'menu.create',
    context: { menuItem: menuItem._id },
  });

  return res.status(201).json({ success: true, menuItem });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const menuItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true });

  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  await ActivityLog.create({
    actor: req.user?.id,
    actorModel: 'Admin',
    action: 'menu.update',
    context: { menuItem: menuItem._id, updates },
  });

  return res.json({ success: true, menuItem });
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await MenuItem.findByIdAndDelete(id);

  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  await ActivityLog.create({
    actor: req.user?.id,
    actorModel: 'Admin',
    action: 'menu.delete',
    context: { menuItem: menuItem._id },
  });

  return res.json({ success: true, message: 'Menu item deleted' });
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Menu item not found' });
  }

  menuItem.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !menuItem.isAvailable;
  await menuItem.save();

  await ActivityLog.create({
    actor: req.user?.id,
    actorModel: 'Admin',
    action: 'menu.toggleAvailability',
    context: { menuItem: menuItem._id, isAvailable: menuItem.isAvailable },
  });

  return res.json({ success: true, menuItem });
});

module.exports = {
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
