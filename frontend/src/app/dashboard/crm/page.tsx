'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Users, Handshake, TrendingUp } from 'lucide-react';
import { crmService } from '@/services/crm.service';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Lead } from '@/types/crm.types';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function CRMPage() {
  const { data: leads, isLoading } = useQuery({
    queryKey: ['crm', 'leads'],
    queryFn: () => crmService.getLeads({ limit: 50 }),
  });

  const { data: companies } = useQuery({
    queryKey: ['crm', 'companies'],
    queryFn: () => crmService.getCompanies({ limit: 10 }),
  });

  const { data: pipelineStats } = useQuery({
    queryKey: ['crm', 'pipeline-stats'],
    queryFn: crmService.getPipelineStats,
  });

  const totalValue = pipelineStats?.reduce((acc, s) => acc + s.totalValue, 0) || 0;
  const wonValue = pipelineStats?.find((s) => s.status === 'WON')?.totalValue || 0;

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      title: 'Nome',
      render: (value) => <span className="font-medium text-white">{String(value)}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <StatusBadge status={String(value)} type="lead" />,
    },
    {
      key: 'value',
      title: 'Valor',
      render: (value) => (
        <span className="text-emerald-400 text-xs font-medium">
          {value ? formatCurrency(Number(value)) : '--'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      render: (value) => (
        <span className="text-slate-400 text-xs">{formatDate(String(value))}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">CRM</h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie seus leads, contatos e empresas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Handshake,
            label: 'Total Leads',
            value: leads?.meta.total || 0,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            icon: TrendingUp,
            label: 'Valor Pipeline',
            value: formatCurrency(totalValue),
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            icon: Building2,
            label: 'Empresas',
            value: companies?.meta.total || 0,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
          },
          {
            icon: Users,
            label: 'Ganhos',
            value: formatCurrency(wonValue),
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
        ].map((stat, i) => (
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
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Leads Table */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Leads Recentes</h2>
        <DataTable
          columns={columns}
          data={leads?.data || []}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="Nenhum lead cadastrado"
        />
      </div>
    </div>
  );
}
