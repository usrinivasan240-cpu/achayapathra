require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { registerSocketServer } = require('./services/socketService');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (process.env.CLIENT_URL || '').split(',').filter(Boolean),
    credentials: true,
  },
});

registerSocketServer(io);

io.on('connection', (socket) => {
  const { userId, orderId, canteenId } = socket.handshake.query;

  if (userId) {
    socket.join(`user:${userId}`);
  }
  if (orderId) {
    socket.join(`order:${orderId}`);
  }
  if (canteenId) {
    socket.join(`canteen:${canteenId}`);
  }

  socket.on('join', (room) => {
    if (room) socket.join(room);
  });

  socket.on('disconnect', () => {
    socket.removeAllListeners();
  });
});

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Canteen ordering backend running on port ${PORT}`);
  });
};

start();
