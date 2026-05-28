import { cn } from '@/lib/utils';
import {
  LICITATION_STATUS_LABELS,
  LICITATION_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  type?: 'licitation' | 'lead' | 'contract' | 'proposal' | 'task';
}

export function StatusBadge({ status, type = 'licitation' }: StatusBadgeProps) {
  let label = status;
  let colorClass = 'bg-slate-500/20 text-slate-300';

  if (type === 'licitation') {
    label = LICITATION_STATUS_LABELS[status] || status;
    colorClass = LICITATION_STATUS_COLORS[status] || colorClass;
  } else if (type === 'lead') {
    label = LEAD_STATUS_LABELS[status] || status;
    colorClass = LEAD_STATUS_COLORS[status] || colorClass;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorClass,
      )}
    >
      {label}
    </span>
  );
}
