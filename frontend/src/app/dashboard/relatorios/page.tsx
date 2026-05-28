'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart2, Download, TrendingUp, Award } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

interface LicitationsReport {
  summary: {
    total: number;
    winRate: number;
    totalWon: number;
    totalLost: number;
    byStatus: Array<{ status: string; count: number; value: number }>;
  };
}

export default function RelatoriosPage() {
  const { data: licitationsReport } = useQuery({
    queryKey: ['reports', 'licitations'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<LicitationsReport>>('/reports/licitations');
      return response.data.data;
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400 text-sm mt-1">Análises e métricas de desempenho</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white transition-colors">
          <Download className="w-4 h-4" /> Exportar
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: BarChart2,
            label: 'Total Licitações',
            value: licitationsReport?.summary.total || 0,
            color: 'text-blue-400',
          },
          {
            icon: Award,
            label: 'Taxa de Vitória',
            value: formatPercentage(licitationsReport?.summary.winRate || 0),
            color: 'text-emerald-400',
          },
          {
            icon: TrendingUp,
            label: 'Ganhas',
            value: licitationsReport?.summary.totalWon || 0,
            color: 'text-green-400',
          },
          {
            icon: BarChart2,
            label: 'Perdidas',
            value: licitationsReport?.summary.totalLost || 0,
            color: 'text-red-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineChart />
        <RevenueChart />
      </div>
    </div>
  );
}
