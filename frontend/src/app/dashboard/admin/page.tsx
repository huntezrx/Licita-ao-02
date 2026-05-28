'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Database, Bot, Globe } from 'lucide-react';
import { DataTable, Column } from '@/components/common/DataTable';
import { formatDateTime } from '@/lib/formatters';
import { USER_ROLE_LABELS } from '@/lib/constants';
import api from '@/lib/api';
import { ApiResponse } from '@/types/api.types';

interface SystemStats {
  users: { total: number; active: number };
  licitations: number;
  contracts: number;
  documents: number;
  ai: { requestsToday: number };
  crawler: { jobsToday: number };
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  user: { id: string; name: string; email: string } | null;
  ip: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<SystemStats>>('/admin/system-stats');
      return response.data.data;
    },
  });

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/audit-logs', { params: { limit: 20 } });
      return response.data.data;
    },
  });

  const statCards = [
    { icon: Users, label: 'Usuários', value: `${stats?.users.active || 0}/${stats?.users.total || 0}`, color: 'text-blue-400' },
    { icon: Database, label: 'Documentos', value: stats?.documents || 0, color: 'text-purple-400' },
    { icon: Bot, label: 'IA Hoje', value: stats?.ai.requestsToday || 0, color: 'text-emerald-400' },
    { icon: Globe, label: 'Crawlers Hoje', value: stats?.crawler.jobsToday || 0, color: 'text-orange-400' },
  ];

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      title: 'Ação',
      render: (v) => <span className="text-xs font-mono text-blue-400">{String(v)}</span>,
    },
    {
      key: 'resource',
      title: 'Recurso',
      render: (v) => <span className="text-xs text-slate-300">{String(v)}</span>,
    },
    {
      key: 'user',
      title: 'Usuário',
      render: (v) => {
        const user = v as AuditLog['user'];
        return <span className="text-xs text-slate-400">{user?.name || 'Sistema'}</span>;
      },
    },
    {
      key: 'ip',
      title: 'IP',
      render: (v) => <span className="text-xs font-mono text-slate-500">{String(v) || '--'}</span>,
    },
    {
      key: 'createdAt',
      title: 'Data/Hora',
      render: (v) => <span className="text-xs text-slate-400">{formatDateTime(String(v))}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-xl">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Administração</h1>
          <p className="text-slate-400 text-sm">Gerenciamento do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
          >
            <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Logs de Auditoria</h3>
        </div>
        <DataTable
          columns={columns}
          data={(auditLogs as { data: AuditLog[] })?.data || []}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="Nenhum log de auditoria"
        />
      </div>
    </div>
  );
}
