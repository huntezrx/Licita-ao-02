'use client';

import { useQuery } from '@tanstack/react-query';
import {
  FileText, TrendingUp, Award, AlertTriangle,
  DollarSign, CheckSquare, FileSignature, Newspaper,
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

export default function DashboardPage() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: dashboardService.getKPIs,
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 border border-blue-500/20 rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white mb-1">Bem-vindo ao SistemaLicitação</h2>
        <p className="text-slate-400 text-sm">
          Aqui está o panorama atual das suas licitações e atividades.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Licitações Ativas"
          value={kpis?.licitations.active || 0}
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          gradient="from-blue-500/10 to-blue-600/10"
          delay={0}
        />
        <StatsCard
          title="Taxa de Vitória"
          value={kpis?.licitations.winRate || 0}
          format={(v) => formatPercentage(Number(v))}
          icon={<Award className="w-5 h-5 text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
          delay={0.1}
        />
        <StatsCard
          title="Receita no Mês"
          value={kpis?.financial.revenueThisMonth || 0}
          format={(v) => formatCurrency(Number(v))}
          icon={<DollarSign className="w-5 h-5 text-violet-400" />}
          gradient="from-violet-500/10 to-purple-500/10"
          delay={0.2}
        />
        <StatsCard
          title="Tarefas Urgentes"
          value={kpis?.tasks.urgent || 0}
          icon={<AlertTriangle className="w-5 h-5 text-orange-400" />}
          gradient="from-orange-500/10 to-red-500/10"
          delay={0.3}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Licitações"
          value={kpis?.licitations.total || 0}
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          delay={0.4}
        />
        <StatsCard
          title="Contratos Ativos"
          value={kpis?.contracts.active || 0}
          icon={<FileSignature className="w-5 h-5 text-emerald-400" />}
          delay={0.5}
        />
        <StatsCard
          title="Tarefas Pendentes"
          value={kpis?.tasks.pending || 0}
          icon={<CheckSquare className="w-5 h-5 text-yellow-400" />}
          delay={0.6}
        />
        <StatsCard
          title="Editais Novos"
          value={kpis?.notices.pending || 0}
          icon={<Newspaper className="w-5 h-5 text-purple-400" />}
          delay={0.7}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <PipelineChart />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        {/* Upcoming Deadlines placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Próximos Prazos</h3>
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Carregando prazos...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
