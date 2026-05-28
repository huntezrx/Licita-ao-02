import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { User } from '@/types/user.types';

export interface SystemStats {
  users: { total: number; active: number; admins: number };
  licitations: { total: number; active: number };
  contracts: { total: number; active: number };
  storage: { used: number; total: number; percentage: number };
  crawlerJobs: { total: number; pending: number; failed: number };
  notifications: { total: number; unread: number };
}

export interface AuditLog {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  async getSystemStats(): Promise<SystemStats> {
    const response = await api.get<ApiResponse<SystemStats>>('/admin/stats');
    return response.data.data;
  },

  async getAuditLogs(filter: AuditLogFilter = {}): Promise<PaginatedResponse<AuditLog>> {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/admin/audit-logs', {
      params: filter,
    });
    return response.data.data;
  },

  async getUsers(filter: { search?: string; role?: string; page?: number; limit?: number } = {}): Promise<
    PaginatedResponse<User & { _count: { notifications: number; tasks: number } }>
  > {
    const response = await api.get<
      ApiResponse<PaginatedResponse<User & { _count: { notifications: number; tasks: number } }>>
    >('/admin/users', { params: filter });
    return response.data.data;
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, {
      isActive,
    });
    return response.data.data;
  },
};
