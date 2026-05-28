'use client';

import { DollarSign, Mail, Phone } from 'lucide-react';
import { Lead } from '@/types/crm.types';
import { formatCurrency } from '@/lib/formatters';

interface KanbanCardProps {
  lead: Lead;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export function KanbanCard({ lead, isDragging = false, onDragStart }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className={`bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 shadow-2xl scale-105 rotate-1' : 'hover:border-slate-600'
      }`}
    >
      <p className="text-sm font-medium text-white mb-2 line-clamp-2">{lead.name}</p>

      <div className="space-y-1.5">
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.value && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <DollarSign className="w-3 h-3 flex-shrink-0" />
            <span>{formatCurrency(lead.value)}</span>
          </div>
        )}
      </div>

      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className="px-1.5 py-0.5 text-slate-500 text-xs">+{lead.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}
