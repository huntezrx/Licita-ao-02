export type NoticeStatus = 'PENDING' | 'ANALYZING' | 'RELEVANT' | 'IRRELEVANT' | 'ARCHIVED';
export type NoticeSource = 'PNCP' | 'COMPRASNET' | 'MANUAL';

export interface Notice {
  id: string;
  externalId: string;
  title: string;
  organ: string;
  modality: string | null;
  estimatedValue: number | null;
  openingDate: string | null;
  closingDate: string | null;
  editalUrl: string | null;
  status: NoticeStatus;
  source: NoticeSource;
  category: string | null;
  tags: string[];
  rawData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFilter {
  status?: NoticeStatus;
  source?: NoticeSource;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
