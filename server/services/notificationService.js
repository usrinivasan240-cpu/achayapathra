const notifications = [];
const { emitOrderEvent } = require('./socketService');

const notifyUser = (userId, payload) => {
  const notification = {
    userId: userId?.toString(),
    ...payload,
    createdAt: new Date().toISOString(),
  };

  notifications.push(notification);
  emitOrderEvent('notifications:new', notification, [`user:${notification.userId}`]);
  return notification;
};

const fetchUserNotifications = (userId) =>
  notifications.filter((notification) => notification.userId === userId?.toString());

module.exports = {
  notifyUser,
  fetchUserNotifications,
};
