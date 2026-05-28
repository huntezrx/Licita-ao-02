import { User } from './user.types';

export type LicitationStatus =
  | 'PROSPECTING'
  | 'ANALYZING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'WON'
  | 'LOST'
  | 'CANCELLED'
  | 'SUSPENDED';

export type LicitationModality =
  | 'PREGAO_ELETRONICO'
  | 'PREGAO_PRESENCIAL'
  | 'CONCORRENCIA'
  | 'TOMADA_DE_PRECOS'
  | 'CONVITE'
  | 'CONCURSO'
  | 'LEILAO'
  | 'DIALOGO_COMPETITIVO'
  | 'DISPENSA'
  | 'INEXIGIBILIDADE'
  | 'RDC';

export interface Licitation {
  id: string;
  number: string;
  title: string;
  organ: string;
  modality: LicitationModality;
  status: LicitationStatus;
  estimatedValue: number | null;
  finalValue: number | null;
  openingDate: string | null;
  closingDate: string | null;
  description: string | null;
  editalUrl: string | null;
  pncpId: string | null;
  comprasnetId: string | null;
  category: string | null;
  tags: string[];
  assignedToId: string | null;
  assignedTo: Pick<User, 'id' | 'name' | 'avatar'> | null;
  _count?: {
    documents: number;
    proposals: number;
    tasks: number;
    contracts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLicitationDto {
  number: string;
  title: string;
  organ: string;
  modality: LicitationModality;
  status?: LicitationStatus;
  estimatedValue?: number;
  openingDate?: string;
  closingDate?: string;
  description?: string;
  editalUrl?: string;
  category?: string;
  tags?: string[];
  assignedToId?: string;
}

export interface LicitationFilter {
  search?: string;
  status?: LicitationStatus;
  modality?: LicitationModality;
  category?: string;
  assignedToId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
