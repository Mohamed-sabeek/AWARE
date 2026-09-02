import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5009/api';
  // Strip trailing /api to connect to root Socket.io server
  return apiUrl.replace(/\/api\/?$/, '');
};

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export default getSocket;
