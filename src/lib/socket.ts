import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const initializeSocket = (params?: {
  userId?: string;
  orderId?: string;
  canteenId?: string;
}) => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  if (!params || (!params.userId && !params.orderId && !params.canteenId)) {
    return null;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    withCredentials: true,
    transports: ['websocket'],
    query: {
      userId: params?.userId,
      orderId: params?.orderId,
      canteenId: params?.canteenId,
    },
  });

  return socket;
};

export const getSocket = () => socket;

export const joinRoom = (room: string) => {
  const activeSocket = getSocket();
  activeSocket?.emit('join', room);
};
