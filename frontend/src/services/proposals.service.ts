import api from '@/lib/api';
import { Proposal, CreateProposalDto, ProposalFilter } from '@/types/proposal.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const proposalsService = {
  async findAll(filter: ProposalFilter = {}): Promise<PaginatedResponse<Proposal>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Proposal>>>('/proposals', {
      params: filter,
    });
    return response.data.data;
  },

  async findOne(id: string): Promise<Proposal> {
    const response = await api.get<ApiResponse<Proposal>>(`/proposals/${id}`);
    return response.data.data;
  },

  async create(data: CreateProposalDto): Promise<Proposal> {
    const response = await api.post<ApiResponse<Proposal>>('/proposals', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateProposalDto>): Promise<Proposal> {
    const response = await api.patch<ApiResponse<Proposal>>(`/proposals/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/proposals/${id}`);
    return response.data.data;
  },
};
