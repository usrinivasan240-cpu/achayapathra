let ioInstance = null;

const registerSocketServer = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

const emitOrderEvent = (event, payload, rooms = []) => {
  if (!ioInstance) return;
  if (!rooms.length) {
    ioInstance.emit(event, payload);
    return;
  }

  rooms.forEach((room) => {
    ioInstance.to(room).emit(event, payload);
  });
};

const emitOrderUpdate = (order) => {
  if (!ioInstance) return;
  emitOrderEvent('order:update', order, [`order:${order._id}`, `canteen:${order.canteen}`]);
};

module.exports = {
  registerSocketServer,
  getIO,
  emitOrderEvent,
  emitOrderUpdate,
};
