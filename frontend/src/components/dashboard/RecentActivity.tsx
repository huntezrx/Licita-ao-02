'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Plus, Edit, Trash2, ArrowRight, Tag } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { formatRelativeTime } from '@/lib/formatters';
import { getInitials } from '@/lib/utils';

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATED: Plus,
  UPDATED: Edit,
  DELETED: Trash2,
  STATUS_CHANGED: ArrowRight,
  DEFAULT: Tag,
};

export function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: () => dashboardService.getRecentActivities(15),
    refetchInterval: 30000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Atividades Recentes</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-slate-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-2 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.length ? (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {data.map((activity, index) => {
            const Icon = activityIcons[activity.type] || activityIcons.DEFAULT;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 flex-shrink-0">
                  {activity.user ? (
                    <span className="text-xs font-bold text-blue-400">
                      {getInitials(activity.user.name)}
                    </span>
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-slate-500">por {activity.user.name}</p>
                  )}
                  <p className="text-xs text-slate-600 mt-0.5">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
