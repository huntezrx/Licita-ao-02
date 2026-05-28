'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, RefreshCw, FileText } from 'lucide-react';
import { licitationsService } from '@/services/licitations.service';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Licitation, LicitationFilter } from '@/types/licitation.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { MODALITY_LABELS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';

interface LicitationsTableProps {
  onNewLicitation?: () => void;
}

export function LicitationsTable({ onNewLicitation }: LicitationsTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<LicitationFilter>({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const queryFilter = { ...filter, search: debouncedSearch || undefined };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['licitations', queryFilter],
    queryFn: () => licitationsService.findAll(queryFilter),
  });

  const columns: Column<Licitation>[] = [
    {
      key: 'number',
      title: 'Número',
      render: (value) => (
        <span className="font-mono text-blue-400 text-xs">{String(value)}</span>
      ),
    },
    {
      key: 'title',
      title: 'Título',
      render: (value) => (
        <span className="text-white font-medium line-clamp-1">{String(value)}</span>
      ),
    },
    {
      key: 'organ',
      title: 'Órgão',
      render: (value) => (
        <span className="text-slate-300 text-xs line-clamp-1">{String(value)}</span>
      ),
    },
    {
      key: 'modality',
      title: 'Modalidade',
      render: (value) => (
        <span className="text-xs text-slate-400">
          {MODALITY_LABELS[String(value)] || String(value)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <StatusBadge status={String(value)} type="licitation" />,
    },
    {
      key: 'estimatedValue',
      title: 'Valor Est.',
      render: (value) => (
        <span className="text-emerald-400 font-medium text-xs">
          {value ? formatCurrency(Number(value)) : '--'}
        </span>
      ),
    },
    {
      key: 'openingDate',
      title: 'Abertura',
      render: (value) => (
        <span className="text-slate-400 text-xs">{value ? formatDate(String(value)) : '--'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pesquisar por título, número, órgão..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as never || undefined, page: 1 }))}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos status</option>
            <option value="PROSPECTING">Prospecção</option>
            <option value="ANALYZING">Em Análise</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="WON">Ganha</option>
            <option value="LOST">Perdida</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onNewLicitation && (
            <button
              onClick={onNewLicitation}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" /> Nova Licitação
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="Nenhuma licitação encontrada"
        pagination={
          data?.meta
            ? {
                page: data.meta.page,
                limit: data.meta.limit,
                total: data.meta.total,
                onPageChange: (page) => setFilter((f) => ({ ...f, page })),
              }
            : undefined
        }
        onRowClick={(row) => router.push(`/licitacoes/${row.id}`)}
      />
    </div>
  );
}
