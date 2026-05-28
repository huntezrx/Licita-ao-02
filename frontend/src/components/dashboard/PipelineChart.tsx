'use client';

import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { dashboardService } from '@/services/dashboard.service';
import { LICITATION_STATUS_LABELS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#6b7280', '#f97316'];

export function PipelineChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'licitations-by-status'],
    queryFn: dashboardService.getLicitationsByStatus,
  });

  const chartData = (data || []).map((item) => ({
    name: LICITATION_STATUS_LABELS[item.status] || item.status,
    value: item.count,
    status: item.status,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">Pipeline de Licitações</h3>
      </div>

      {isLoading ? (
        <div className="h-56 flex items-center justify-center">
          <div className="animate-pulse text-slate-500 text-sm">Carregando...</div>
        </div>
      ) : !chartData.length ? (
        <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
          Nenhum dado disponível
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
