'use client';

import { TaskPriority } from '@/types/task.types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; class: string; dot: string }> = {
  LOW: { label: 'Baixa', class: 'bg-slate-700 text-slate-300', dot: 'bg-slate-400' },
  MEDIUM: { label: 'Média', class: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-400' },
  HIGH: { label: 'Alta', class: 'bg-orange-500/20 text-orange-300', dot: 'bg-orange-400' },
  URGENT: { label: 'Urgente', class: 'bg-red-500/20 text-red-300 animate-pulse', dot: 'bg-red-400' },
};

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padding} ${textSize} font-medium rounded-lg ${config.class}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
