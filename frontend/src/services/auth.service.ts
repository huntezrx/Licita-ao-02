import api from '@/lib/api';
import { LoginResponse, User } from '@/types/user.types';
import { ApiResponse } from '@/types/api.types';

export const authService = {
  async login(email: string, password: string, twoFactorCode?: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
      twoFactorCode,
    });
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.delete('/auth/logout');
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data.data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password });
    return response.data.data;
  },

  async setup2FA(): Promise<{ secret: string; qrCodeUrl: string }> {
    const response = await api.post<ApiResponse<{ secret: string; qrCodeUrl: string }>>('/auth/2fa/setup');
    return response.data.data;
  },

  async enable2FA(code: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/2fa/enable', { code });
    return response.data.data;
  },

  async disable2FA(code: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/2fa/disable', { code });
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data;
  },
};
