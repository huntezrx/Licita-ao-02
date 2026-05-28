import { io, Socket } from 'socket.io-client';
import { WS_URL } from './constants';

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

export function disconnectSocket(socket: Socket | null): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
