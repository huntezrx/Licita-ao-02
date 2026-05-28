import { User } from './user.types';

export type ProposalStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Proposal {
  id: string;
  licitationId: string;
  title: string;
  status: ProposalStatus;
  value: number;
  description: string | null;
  technicalScore: number | null;
  competitorCount: number | null;
  submittedAt: string | null;
  responseAt: string | null;
  assignedToId: string | null;
  assignedTo: Pick<User, 'id' | 'name' | 'avatar'> | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalDto {
  licitationId: string;
  title: string;
  status?: ProposalStatus;
  value: number;
  description?: string;
  technicalScore?: number;
  competitorCount?: number;
  submittedAt?: string;
  assignedToId?: string;
  tags?: string[];
}

export interface ProposalFilter {
  search?: string;
  status?: ProposalStatus;
  licitationId?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}
