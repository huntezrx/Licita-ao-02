import { io, Socket } from 'socket.io-client';
import { WS_URL } from './constants';
import { getAccessToken } from './api';

let socketInstance: Socket | null = null;

export function createSocket(token: string): Socket {
  return io(`${WS_URL}/notifications`, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket'],
    autoConnect: false,
  });
}

export function getSocket(): Socket {
  if (!socketInstance) {
    const token = getAccessToken() || '';
    socketInstance = io(`${WS_URL}/notifications`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });
  }
  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance?.connected) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
