import api from '@/lib/api';
import { Task, CreateTaskDto, TaskFilter } from '@/types/task.types';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

export const tasksService = {
  async findAll(filter: TaskFilter = {}): Promise<PaginatedResponse<Task>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>('/tasks', {
      params: filter,
    });
    return response.data.data;
  },

  async getMyTasks(filter: Omit<TaskFilter, 'assignedToId'> = {}): Promise<PaginatedResponse<Task>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>('/tasks/mine', {
      params: filter,
    });
    return response.data.data;
  },

  async findOne(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateTaskDto>): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, { status });
    return response.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
    return response.data.data;
  },
};
