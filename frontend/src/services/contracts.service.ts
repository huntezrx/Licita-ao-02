import api from '@/lib/api';
import { Contract, CreateContractDto, ContractFilter } from '@/types/contract.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const contractsService = {
  async findAll(filter: ContractFilter = {}): Promise<PaginatedResponse<Contract>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Contract>>>('/contracts', {
      params: filter,
    });
    return response.data.data;
  },

  async findOne(id: string): Promise<Contract> {
    const response = await api.get<ApiResponse<Contract>>(`/contracts/${id}`);
    return response.data.data;
  },

  async create(data: CreateContractDto): Promise<Contract> {
    const response = await api.post<ApiResponse<Contract>>('/contracts', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateContractDto>): Promise<Contract> {
    const response = await api.patch<ApiResponse<Contract>>(`/contracts/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/contracts/${id}`);
    return response.data.data;
  },

  async getExpiring(days = 30): Promise<Contract[]> {
    const response = await api.get<ApiResponse<Contract[]>>('/contracts/expiring', {
      params: { days },
    });
    return response.data.data;
  },
};
