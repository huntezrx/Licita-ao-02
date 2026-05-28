import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Notification } from '@/types/notification.types';

export const notificationsService = {
  async findAll(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params });
    return response.data.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
