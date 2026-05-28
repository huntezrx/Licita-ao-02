'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX } from 'lucide-react';
import { USER_ROLE_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/formatters';
import { getInitials } from '@/lib/utils';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';
import { User } from '@/types/user.types';

export default function EquipesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users');
      return response.data.data;
    },
  });

  const active = data?.data.filter((u) => u.isActive).length || 0;
  const inactive = data?.data.filter((u) => !u.isActive).length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Equipes</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie usuários e equipes</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total', value: data?.meta.total || 0, color: 'text-blue-400' },
          { icon: UserCheck, label: 'Ativos', value: active, color: 'text-emerald-400' },
          { icon: UserX, label: 'Inativos', value: inactive, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-full" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-24" />
                  <div className="h-2 bg-slate-800 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((user) => (
            <div
              key={user.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded-full">
                  {USER_ROLE_LABELS[user.role] || user.role}
                </span>
                <span className={`text-xs font-medium ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {user.lastLogin && (
                <p className="text-xs text-slate-600 mt-2">
                  Último acesso: {formatDateTime(user.lastLogin)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
