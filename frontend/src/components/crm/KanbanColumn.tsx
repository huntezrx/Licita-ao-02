'use client';

import { LeadStatus, Lead } from '@/types/crm.types';
import { KanbanCard } from './KanbanCard';
import { LEAD_STATUS_LABELS } from '@/lib/constants';

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  color: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent, status: LeadStatus) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export function KanbanColumn({
  status,
  leads,
  color,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
      className={`flex-1 min-w-[220px] max-w-[280px] flex flex-col bg-slate-900 border rounded-2xl transition-all duration-150 ${
        isDragOver ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <span className="text-sm font-semibold text-white">
            {LEAD_STATUS_LABELS[status]}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {leads.length === 0 ? (
          <div
            className={`h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-xs text-slate-600 transition-all ${
              isDragOver ? 'border-blue-500 text-blue-500' : 'border-slate-800'
            }`}
          >
            {isDragOver ? 'Soltar aqui' : 'Sem leads'}
          </div>
        ) : (
          leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  );
}
