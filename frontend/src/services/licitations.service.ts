import api from '@/lib/api';
import { Licitation, CreateLicitationDto, LicitationFilter } from '@/types/licitation.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const licitationsService = {
  async findAll(filter: LicitationFilter = {}): Promise<PaginatedResponse<Licitation>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Licitation>>>('/licitations', {
      params: filter,
    });
    return response.data.data;
  },

  async findOne(id: string): Promise<Licitation> {
    const response = await api.get<ApiResponse<Licitation>>(`/licitations/${id}`);
    return response.data.data;
  },

  async create(data: CreateLicitationDto): Promise<Licitation> {
    const response = await api.post<ApiResponse<Licitation>>('/licitations', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateLicitationDto>): Promise<Licitation> {
    const response = await api.patch<ApiResponse<Licitation>>(`/licitations/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/licitations/${id}`);
    return response.data.data;
  },

  async getStatsByStatus(): Promise<Array<{ status: string; count: number; totalValue: number }>> {
    const response = await api.get<ApiResponse<Array<{ status: string; count: number; totalValue: number }>>>(
      '/licitations/stats/status',
    );
    return response.data.data;
  },

  async getUpcoming(days = 7): Promise<Licitation[]> {
    const response = await api.get<ApiResponse<Licitation[]>>('/licitations/upcoming', {
      params: { days },
    });
    return response.data.data;
  },
};
