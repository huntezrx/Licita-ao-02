'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { Notification } from '@/types/notification.types';
import { toast } from 'sonner';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead: markAsReadStore,
    markAllAsRead: markAllAsReadStore,
    setUnreadCount,
  } = useNotificationStore();

  const queryClient = useQueryClient();

  // Fetch notifications
  const { refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const data = await notificationsService.findAll({ limit: 50 });
      setNotifications(data.data);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  // Fetch unread count
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const data = await notificationsService.getUnreadCount();
      setUnreadCount(data.count);
      return data;
    },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  // Socket.io for real-time notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    socket.on('notification', (notification: Notification) => {
      addNotification(notification);
      toast(notification.title, {
        description: notification.message,
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.off('notification');
    };
  }, [isAuthenticated, addNotification, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: (_, id) => {
      markAsReadStore(id);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      markAllAsReadStore();
      refetch();
    },
  });

  return {
    notifications,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refetch,
  };
}
