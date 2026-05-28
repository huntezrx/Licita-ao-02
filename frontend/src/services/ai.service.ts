import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { AIHistory, AIResponse, ChatMessage } from '@/types/ai.types';

export const aiService = {
  async summarize(licitationId: string): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>(`/ai/summarize/${licitationId}`);
    return response.data.data;
  },

  async analyzeRisks(licitationId: string): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>(`/ai/analyze-risks/${licitationId}`);
    return response.data.data;
  },

  async generateProposal(licitationId: string, additionalContext?: string): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>(`/ai/generate-proposal/${licitationId}`, {
      additionalContext,
    });
    return response.data.data;
  },

  async extractRequirements(licitationId: string): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>(`/ai/extract-requirements/${licitationId}`);
    return response.data.data;
  },

  async chat(
    message: string,
    conversationHistory?: ChatMessage[],
    licitationId?: string,
  ): Promise<AIResponse> {
    const response = await api.post<ApiResponse<AIResponse>>('/ai/chat', {
      message,
      conversationHistory,
      licitationId,
    });
    return response.data.data;
  },

  async getHistory(params: { page?: number; limit?: number; type?: string } = {}): Promise<PaginatedResponse<AIHistory>> {
    const response = await api.get<ApiResponse<PaginatedResponse<AIHistory>>>('/ai/history', { params });
    return response.data.data;
  },
};
