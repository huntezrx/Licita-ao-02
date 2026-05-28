'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { financialService } from '@/services/financial.service';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { formatCurrency } from '@/lib/formatters';

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-semibold text-white">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function CashFlowChart({ months = 12 }: { months?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['financial', 'cash-flow', months],
    queryFn: () => financialService.getCashFlow(months),
  });

  if (isLoading) {
    return <SkeletonLoader count={1} height="h-64" />;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-base font-semibold text-white mb-5">Fluxo de Caixa</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Receita"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gradRevenue)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Despesas"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#gradExpenses)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
