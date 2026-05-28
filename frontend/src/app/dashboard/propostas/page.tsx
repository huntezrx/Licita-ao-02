'use client';

import { useQuery } from '@tanstack/react-query';
import { Send, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

interface Proposal {
  id: string;
  title: string;
  value: number;
  status: string;
  submittedAt: string | null;
  licitation: { id: string; number: string; title: string } | null;
  createdAt: string;
}

const PROPOSAL_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-slate-500/20 text-slate-300' },
  SUBMITTED: { label: 'Enviada', color: 'bg-blue-500/20 text-blue-300' },
  UNDER_REVIEW: { label: 'Em Análise', color: 'bg-yellow-500/20 text-yellow-300' },
  ACCEPTED: { label: 'Aceita', color: 'bg-emerald-500/20 text-emerald-300' },
  REJECTED: { label: 'Rejeitada', color: 'bg-red-500/20 text-red-300' },
  WITHDRAWN: { label: 'Retirada', color: 'bg-slate-600/20 text-slate-400' },
};

export default function PropostasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<Proposal>>>('/proposals');
      return response.data.data;
    },
  });

  const columns: Column<Proposal>[] = [
    {
      key: 'title',
      title: 'Título',
      render: (v) => <span className="font-medium text-white">{String(v)}</span>,
    },
    {
      key: 'licitation',
      title: 'Licitação',
      render: (v) => {
        const lic = v as Proposal['licitation'];
        return lic ? (
          <span className="text-xs text-blue-400 font-mono">{lic.number}</span>
        ) : (
          <span className="text-slate-500">--</span>
        );
      },
    },
    {
      key: 'value',
      title: 'Valor',
      render: (v) => <span className="text-emerald-400 text-sm font-medium">{formatCurrency(Number(v))}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (v) => {
        const config = PROPOSAL_STATUS[String(v)];
        return (
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', config?.color || 'bg-slate-500/20 text-slate-300')}>
            {config?.label || String(v)}
          </span>
        );
      },
    },
    {
      key: 'submittedAt',
      title: 'Enviada em',
      render: (v) => <span className="text-slate-400 text-xs">{v ? formatDate(String(v)) : '--'}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Propostas</h1>
        <p className="text-slate-400 text-sm mt-1">Gerenciamento de propostas comerciais</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Send, label: 'Total', value: data?.meta.total || 0, color: 'text-blue-400' },
          { icon: CheckCircle, label: 'Aceitas', value: data?.data.filter((p) => p.status === 'ACCEPTED').length || 0, color: 'text-emerald-400' },
          { icon: Clock, label: 'Em Análise', value: data?.data.filter((p) => p.status === 'UNDER_REVIEW').length || 0, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="Nenhuma proposta encontrada"
      />
    </div>
  );
}
