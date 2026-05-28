import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

interface DashboardKPIs {
  licitations: { total: number; active: number; won: number; winRate: number };
  tasks: { pending: number; urgent: number };
  contracts: { total: number; active: number };
  financial: { revenueThisMonth: number };
  notices: { total: number; pending: number };
}

interface FinancialChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  userId: string | null;
  entityId: string;
  entityType: string;
  user: { id: string; name: string; avatar: string | null } | null;
  createdAt: string;
}

export const dashboardService = {
  async getKPIs(): Promise<DashboardKPIs> {
    const response = await api.get<ApiResponse<DashboardKPIs>>('/dashboard/kpis');
    return response.data.data;
  },

  async getRecentActivities(limit = 20): Promise<Activity[]> {
    const response = await api.get<ApiResponse<Activity[]>>('/dashboard/recent-activities', {
      params: { limit },
    });
    return response.data.data;
  },

  async getLicitationsByStatus() {
    const response = await api.get<ApiResponse<Array<{ status: string; count: number; value: number }>>>(
      '/dashboard/licitations-by-status',
    );
    return response.data.data;
  },

  async getUpcomingDeadlines() {
    const response = await api.get('/dashboard/upcoming-deadlines');
    return response.data.data;
  },

  async getFinancialChart(months = 6): Promise<FinancialChartData[]> {
    const response = await api.get<ApiResponse<FinancialChartData[]>>('/dashboard/financial-chart', {
      params: { months },
    });
    return response.data.data;
  },
};
