import { User } from './user.types';

export type ContractStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'FINISHED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Contract {
  id: string;
  number: string;
  title: string;
  licitationId: string | null;
  clientName: string;
  clientCnpj: string | null;
  status: ContractStatus;
  value: number;
  startDate: string;
  endDate: string;
  description: string | null;
  fileUrl: string | null;
  assignedToId: string | null;
  assignedTo: Pick<User, 'id' | 'name' | 'avatar'> | null;
  tags: string[];
  _count?: {
    documents: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDto {
  number: string;
  title: string;
  licitationId?: string;
  clientName: string;
  clientCnpj?: string;
  status?: ContractStatus;
  value: number;
  startDate: string;
  endDate: string;
  description?: string;
  assignedToId?: string;
  tags?: string[];
}

export interface ContractFilter {
  search?: string;
  status?: ContractStatus;
  startDate?: string;
  endDate?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
