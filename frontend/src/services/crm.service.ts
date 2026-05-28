import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { Lead, Company, Contact } from '@/types/crm.types';

export const crmService = {
  // Leads
  async getLeads(params: Record<string, string | number> = {}): Promise<PaginatedResponse<Lead>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Lead>>>('/crm/leads', { params });
    return response.data.data;
  },

  async getLead(id: string): Promise<Lead> {
    const response = await api.get<ApiResponse<Lead>>(`/crm/leads/${id}`);
    return response.data.data;
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await api.post<ApiResponse<Lead>>('/crm/leads', data);
    return response.data.data;
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const response = await api.patch<ApiResponse<Lead>>(`/crm/leads/${id}`, data);
    return response.data.data;
  },

  async deleteLead(id: string): Promise<void> {
    await api.delete(`/crm/leads/${id}`);
  },

  async getPipelineStats(): Promise<Array<{ status: string; count: number; totalValue: number }>> {
    const response = await api.get<ApiResponse<Array<{ status: string; count: number; totalValue: number }>>>(
      '/crm/leads/pipeline-stats',
    );
    return response.data.data;
  },

  // Companies
  async getCompanies(params: Record<string, string | number> = {}): Promise<PaginatedResponse<Company>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Company>>>('/crm/companies', { params });
    return response.data.data;
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    const response = await api.post<ApiResponse<Company>>('/crm/companies', data);
    return response.data.data;
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const response = await api.patch<ApiResponse<Company>>(`/crm/companies/${id}`, data);
    return response.data.data;
  },

  // Contacts
  async getContacts(params: Record<string, string | number> = {}): Promise<PaginatedResponse<Contact>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Contact>>>('/crm/contacts', { params });
    return response.data.data;
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    const response = await api.post<ApiResponse<Contact>>('/crm/contacts', data);
    return response.data.data;
  },
};
