export type AIHistoryType =
  | 'SUMMARIZE'
  | 'ANALYZE_RISKS'
  | 'GENERATE_PROPOSAL'
  | 'EXTRACT_REQUIREMENTS'
  | 'CHAT'
  | 'CLASSIFY';

export interface AIHistory {
  id: string;
  userId: string;
  type: AIHistoryType;
  prompt: string;
  response: string;
  tokens: number;
  cost: number;
  licitationId: string | null;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIResponse {
  response: string;
  tokens: number;
  cost: number;
}
