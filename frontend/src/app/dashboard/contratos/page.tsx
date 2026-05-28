'use client';

import { useQuery } from '@tanstack/react-query';
import { FileSignature, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

interface Contract {
  id: string;
  number: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
}

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  TERMINATED: 'Encerrado',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
};

const CONTRACT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-500/20 text-slate-300',
  ACTIVE: 'bg-emerald-500/20 text-emerald-300',
  SUSPENDED: 'bg-yellow-500/20 text-yellow-300',
  TERMINATED: 'bg-blue-500/20 text-blue-300',
  EXPIRED: 'bg-red-500/20 text-red-300',
  CANCELLED: 'bg-red-900/20 text-red-400',
};

export default function ContratosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<Contract>>>('/contracts');
      return response.data.data;
    },
  });

  const columns: Column<Contract>[] = [
    {
      key: 'number',
      title: 'Número',
      render: (v) => <span className="font-mono text-blue-400 text-xs">{String(v)}</span>,
    },
    {
      key: 'title',
      title: 'Título',
      render: (v) => <span className="font-medium text-white line-clamp-1">{String(v)}</span>,
    },
    {
      key: 'value',
      title: 'Valor',
      render: (v) => <span className="text-emerald-400 text-xs font-medium">{formatCurrency(Number(v))}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (v) => (
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', CONTRACT_STATUS_COLORS[String(v)] || 'bg-slate-500/20 text-slate-300')}>
          {CONTRACT_STATUS_LABELS[String(v)] || String(v)}
        </span>
      ),
    },
    {
      key: 'endDate',
      title: 'Vencimento',
      render: (v) => <span className="text-slate-400 text-xs">{formatDate(String(v))}</span>,
    },
  ];

  const active = data?.data.filter((c) => c.status === 'ACTIVE').length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Contratos</h1>
        <p className="text-slate-400 text-sm mt-1">Gestão de contratos e aditivos</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: FileSignature, label: 'Total Contratos', value: data?.meta.total || 0, color: 'text-blue-400' },
          { icon: CheckCircle, label: 'Ativos', value: active, color: 'text-emerald-400' },
          { icon: AlertTriangle, label: 'Vencendo em 30d', value: 0, color: 'text-orange-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="Nenhum contrato encontrado"
      />
    </div>
  );
}
