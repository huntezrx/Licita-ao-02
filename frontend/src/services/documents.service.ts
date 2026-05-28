import api from '@/lib/api';
import { Document, DocumentFilter } from '@/types/document.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const documentsService = {
  async findAll(filter: DocumentFilter = {}): Promise<PaginatedResponse<Document>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Document>>>('/documents', {
      params: filter,
    });
    return response.data.data;
  },

  async findOne(id: string): Promise<Document> {
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data.data;
  },

  async upload(
    file: File,
    metadata: {
      category: Document['category'];
      licitationId?: string;
      contractId?: string;
      proposalId?: string;
      tags?: string[];
      notes?: string;
    },
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', metadata.category);
    if (metadata.licitationId) formData.append('licitationId', metadata.licitationId);
    if (metadata.contractId) formData.append('contractId', metadata.contractId);
    if (metadata.proposalId) formData.append('proposalId', metadata.proposalId);
    if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
    if (metadata.notes) formData.append('notes', metadata.notes);

    const response = await api.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getDownloadUrl(id: string): Promise<{ url: string; expiresIn: number }> {
    const response = await api.get<ApiResponse<{ url: string; expiresIn: number }>>(
      `/documents/${id}/download-url`,
    );
    return response.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/documents/${id}`);
    return response.data.data;
  },
};
