import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  socketId: string | null;
  lastPing: Date | null;

  setConnected: (connected: boolean, socketId?: string) => void;
  setLastPing: (date: Date) => void;
  reset: () => void;
}

export const useSocketStore = create<SocketState>()((set) => ({
  isConnected: false,
  socketId: null,
  lastPing: null,

  setConnected: (connected, socketId = null) =>
    set({ isConnected: connected, socketId }),

  setLastPing: (date) => set({ lastPing: date }),

  reset: () => set({ isConnected: false, socketId: null, lastPing: null }),
}));
