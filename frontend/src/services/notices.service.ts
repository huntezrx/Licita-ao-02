import api from '@/lib/api';
import { Notice, NoticeFilter } from '@/types/notice.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const noticesService = {
  async findAll(filter: NoticeFilter = {}): Promise<PaginatedResponse<Notice>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Notice>>>('/notices', {
      params: filter,
    });
    return response.data.data;
  },

  async findOne(id: string): Promise<Notice> {
    const response = await api.get<ApiResponse<Notice>>(`/notices/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, status: Notice['status']): Promise<Notice> {
    const response = await api.patch<ApiResponse<Notice>>(`/notices/${id}/status`, { status });
    return response.data.data;
  },

  async triggerCrawl(): Promise<{ message: string; jobId: string }> {
    const response = await api.post<ApiResponse<{ message: string; jobId: string }>>(
      '/crawler/trigger',
    );
    return response.data.data;
  },
};
