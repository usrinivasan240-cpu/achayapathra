const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const ActivityLog = require('../models/ActivityLog');

const createReview = asyncHandler(async (req, res) => {
  const { menuItem, rating, comment } = req.body;

  if (!menuItem || !rating) {
    return res.status(400).json({ success: false, message: 'Menu item and rating are required' });
  }

  const review = await Review.create({
    user: req.user.id,
    menuItem,
    rating,
    comment,
  });

  const ratings = await Review.find({ menuItem });
  const avgRating = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
  await MenuItem.findByIdAndUpdate(menuItem, { rating: Math.round(avgRating * 10) / 10 });

  await ActivityLog.create({
    actor: req.user.id,
    actorModel: 'User',
    action: 'review.create',
    context: { reviewId: review._id, menuItem },
  });

  return res.status(201).json({ success: true, review });
});

const listReviews = asyncHandler(async (req, res) => {
  const { menuItem } = req.query;
  if (!menuItem) {
    return res.status(400).json({ success: false, message: 'menuItem query parameter is required' });
  }

  const reviews = await Review.find({ menuItem })
    .populate('user', 'name avatarUrl')
    .sort({ createdAt: -1 });

  return res.json({ success: true, reviews });
});

module.exports = {
  createReview,
  listReviews,
};
