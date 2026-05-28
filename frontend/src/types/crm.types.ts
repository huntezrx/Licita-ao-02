import { User } from './user.types';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'INACTIVE';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  status: LeadStatus;
  source: string | null;
  assignedToId: string | null;
  assignedTo: Pick<User, 'id' | 'name' | 'avatar'> | null;
  tags: string[];
  notes: string | null;
  value: number | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  tags: string[];
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  companyId: string | null;
  company: Pick<Company, 'id' | 'name'> | null;
  notes: string | null;
  tags: string[];
  createdAt: string;
}
