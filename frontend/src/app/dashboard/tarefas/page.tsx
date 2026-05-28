'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Clock, AlertTriangle } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { formatDate } from '@/lib/formatters';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: { id: string; name: string } | null;
  licitation: { id: string; number: string; title: string } | null;
}

export default function TarefasPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<Task>>>('/tasks', {
        params: { limit: 50, ...(statusFilter && { status: statusFilter }) },
      });
      return response.data.data;
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const columns: Column<Task>[] = [
    {
      key: 'title',
      title: 'Título',
      render: (value) => <span className="font-medium text-white">{String(value)}</span>,
    },
    {
      key: 'priority',
      title: 'Prioridade',
      render: (value) => (
        <span className={cn('text-xs font-medium', TASK_PRIORITY_COLORS[String(value)])}>
          {TASK_PRIORITY_LABELS[String(value)] || String(value)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => (
        <select
          value={String(value)}
          onChange={(e) => updateTaskMutation.mutate({ id: row.id as string, status: e.target.value })}
          className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300"
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'dueDate',
      title: 'Prazo',
      render: (value) => (
        <span className={cn('text-xs', value && new Date(String(value)) < new Date() ? 'text-red-400' : 'text-slate-400')}>
          {value ? formatDate(String(value)) : '--'}
        </span>
      ),
    },
    {
      key: 'assignedTo',
      title: 'Responsável',
      render: (value) => {
        const user = value as Task['assignedTo'];
        return <span className="text-xs text-slate-400">{user?.name || '--'}</span>;
      },
    },
  ];

  const pending = data?.data.filter((t) => t.status === 'TODO').length || 0;
  const inProgress = data?.data.filter((t) => t.status === 'IN_PROGRESS').length || 0;
  const urgent = data?.data.filter((t) => t.priority === 'URGENT').length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Tarefas</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie e acompanhe todas as tarefas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: CheckSquare, label: 'A Fazer', value: pending, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Clock, label: 'Em Andamento', value: inProgress, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: AlertTriangle, label: 'Urgentes', value: urgent, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className={`p-2 rounded-xl ${stat.bg} w-fit mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300"
        >
          <option value="">Todos</option>
          {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="Nenhuma tarefa encontrada"
      />
    </div>
  );
}
