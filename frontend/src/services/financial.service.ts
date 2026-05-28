import api from '@/lib/api';
import {
  Financial,
  CreateFinancialDto,
  FinancialFilter,
  FinancialSummary,
  CashFlowPoint,
} from '@/types/financial.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const financialService = {
  async findAll(filter: FinancialFilter = {}): Promise<PaginatedResponse<Financial>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Financial>>>('/financial', {
      params: filter,
    });
    return response.data.data;
  },

  async findOne(id: string): Promise<Financial> {
    const response = await api.get<ApiResponse<Financial>>(`/financial/${id}`);
    return response.data.data;
  },

  async create(data: CreateFinancialDto): Promise<Financial> {
    const response = await api.post<ApiResponse<Financial>>('/financial', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateFinancialDto>): Promise<Financial> {
    const response = await api.patch<ApiResponse<Financial>>(`/financial/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/financial/${id}`);
    return response.data.data;
  },

  async getSummary(): Promise<FinancialSummary> {
    const response = await api.get<ApiResponse<FinancialSummary>>('/financial/summary');
    return response.data.data;
  },

  async getCashFlow(months = 12): Promise<CashFlowPoint[]> {
    const response = await api.get<ApiResponse<CashFlowPoint[]>>('/financial/cash-flow', {
      params: { months },
    });
    return response.data.data;
  },
};
