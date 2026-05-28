import { User } from './user.types';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  licitationId: string | null;
  contractId: string | null;
  assignedToId: string | null;
  assignedTo: Pick<User, 'id' | 'name' | 'avatar'> | null;
  createdById: string;
  createdBy: Pick<User, 'id' | 'name' | 'avatar'>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  licitationId?: string;
  contractId?: string;
  assignedToId?: string;
  tags?: string[];
}

export interface TaskFilter {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  licitationId?: string;
  contractId?: string;
  dueDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
