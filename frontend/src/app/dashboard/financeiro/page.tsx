'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { formatCurrency } from '@/lib/formatters';
import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  byType: Array<{ type: string; total: number; count: number }>;
}

export default function FinanceiroPage() {
  const { data: summary } = useQuery({
    queryKey: ['financial', 'summary'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<FinancialSummary>>('/financial/summary');
      return response.data.data;
    },
  });

  const stats = [
    {
      label: 'Receita Total',
      value: formatCurrency(summary?.revenue || 0),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Despesas Totais',
      value: formatCurrency(summary?.expenses || 0),
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Lucro Líquido',
      value: formatCurrency(summary?.profit || 0),
      icon: DollarSign,
      color: (summary?.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: (summary?.profit || 0) >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Margem',
      value: summary?.revenue
        ? `${Math.round(((summary.profit) / summary.revenue) * 100)}%`
        : '0%',
      icon: BarChart2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Financeiro</h1>
        <p className="text-slate-400 text-sm mt-1">Controle financeiro e fluxo de caixa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
          >
            <div className={`p-2 rounded-xl ${stat.bg} w-fit mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <RevenueChart />
    </div>
  );
}
