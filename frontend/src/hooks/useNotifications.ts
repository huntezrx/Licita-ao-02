'use client';

import { useCallback } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';

// Demo mode: no backend calls, no socket — just return local store state
export function useNotifications() {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    markAsRead: markAsReadStore,
    markAllAsRead: markAllAsReadStore,
  } = useNotificationStore();

  const isDemo = user?.id === 'demo-001';

  const markAsRead = useCallback((id: string) => {
    markAsReadStore(id);
  }, [markAsReadStore]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadStore();
  }, [markAllAsReadStore]);

  const refetch = useCallback(() => {
    // no-op in demo mode
  }, []);

  return {
    notifications: isDemo ? [] : notifications,
    unreadCount: isDemo ? 0 : unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}
