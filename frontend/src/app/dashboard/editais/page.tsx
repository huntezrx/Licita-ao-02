'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, RefreshCw } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/formatters';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

interface Notice {
  id: string;
  title: string;
  organ: string;
  modality: string | null;
  value: number | null;
  status: string;
  source: string;
  openingDate: string | null;
  createdAt: string;
}

export default function EditaisPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notices', page, statusFilter],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<Notice>>>('/notices', {
        params: { page, limit: 20, ...(statusFilter && { status: statusFilter }) },
      });
      return response.data.data;
    },
  });

  const columns: Column<Notice>[] = [
    {
      key: 'title',
      title: 'Título',
      render: (v) => <span className="font-medium text-white line-clamp-2 text-xs">{String(v)}</span>,
    },
    {
      key: 'organ',
      title: 'Órgão',
      render: (v) => <span className="text-slate-400 text-xs">{String(v)}</span>,
    },
    {
      key: 'source',
      title: 'Fonte',
      render: (v) => (
        <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded-full">
          {String(v)}
        </span>
      ),
    },
    {
      key: 'value',
      title: 'Valor',
      render: (v) => (
        <span className="text-emerald-400 text-xs">
          {v ? formatCurrency(Number(v)) : '--'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (v) => <StatusBadge status={String(v)} />,
    },
    {
      key: 'createdAt',
      title: 'Publicado',
      render: (v) => <span className="text-slate-500 text-xs">{formatRelativeTime(String(v))}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Editais</h1>
          <p className="text-slate-400 text-sm mt-1">
            Editais coletados automaticamente do PNCP e ComprasNet
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="ANALYZING">Em Análise</option>
          <option value="APPROVED">Aprovado</option>
          <option value="REJECTED">Rejeitado</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="Nenhum edital encontrado. Execute o crawler para buscar editais."
        pagination={
          data?.meta
            ? {
                page: data.meta.page,
                limit: data.meta.limit,
                total: data.meta.total,
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </div>
  );
}
