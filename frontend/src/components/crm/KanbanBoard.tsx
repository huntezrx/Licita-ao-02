'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { crmService } from '@/services/crm.service';
import { Lead, LeadStatus } from '@/types/crm.types';
import { formatCurrency } from '@/lib/formatters';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PIPELINE_STAGES: LeadStatus[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION',
];

function KanbanCard({ lead, onDragStart }: { lead: Lead; onDragStart: (lead: Lead) => void }) {
  return (
    <motion.div
      layout
      draggable
      onDragStart={() => onDragStart(lead)}
      className="bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-colors"
    >
      <p className="text-sm font-medium text-white leading-tight mb-1">{lead.name}</p>
      {lead.value && (
        <p className="text-xs text-emerald-400 font-medium">{formatCurrency(lead.value)}</p>
      )}
      {lead.assignedTo && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
            <span className="text-xs text-white font-bold">{lead.assignedTo.name.charAt(0)}</span>
          </div>
          <span className="text-xs text-slate-400">{lead.assignedTo.name}</span>
        </div>
      )}
    </motion.div>
  );
}

function KanbanColumn({
  status,
  leads,
  onDrop,
  onDragStart,
  stats,
}: {
  status: LeadStatus;
  leads: Lead[];
  onDrop: (status: LeadStatus) => void;
  onDragStart: (lead: Lead) => void;
  stats: { count: number; value: number };
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const label = LEAD_STATUS_LABELS[status] || status;
  const colorClass = LEAD_STATUS_COLORS[status] || 'bg-slate-500/20 text-slate-300';

  return (
    <div
      className={cn(
        'flex flex-col min-w-[260px] max-w-[300px] rounded-2xl border transition-colors',
        isDragOver ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 bg-slate-900/50',
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => { setIsDragOver(false); onDrop(status); }}
    >
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full', colorClass)}>
            {label}
          </span>
          <span className="text-xs text-slate-400 font-medium">{stats.count}</span>
        </div>
        {stats.value > 0 && (
          <p className="text-xs text-emerald-400 mt-1">{formatCurrency(stats.value)}</p>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const { data } = useQuery({
    queryKey: ['crm', 'leads'],
    queryFn: () => crmService.getLeads({ limit: 100 }),
  });

  const { data: pipelineStats } = useQuery({
    queryKey: ['crm', 'pipeline-stats'],
    queryFn: crmService.getPipelineStats,
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      crmService.updateLead(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm'] });
    },
    onError: () => {
      toast.error('Erro ao mover lead');
    },
  });

  const leads = data?.data || [];

  const handleDrop = (status: LeadStatus) => {
    if (!draggedLead || draggedLead.status === status) return;
    updateLeadMutation.mutate({ id: draggedLead.id, status });
    setDraggedLead(null);
  };

  const getColumnLeads = (status: LeadStatus) =>
    leads.filter((lead) => lead.status === status);

  const getColumnStats = (status: LeadStatus) => {
    const colLeads = getColumnLeads(status);
    return {
      count: colLeads.length,
      value: colLeads.reduce((acc, lead) => acc + (lead.value || 0), 0),
    };
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {PIPELINE_STAGES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={getColumnLeads(status)}
            onDrop={handleDrop}
            onDragStart={setDraggedLead}
            stats={getColumnStats(status)}
          />
        ))}
      </div>
    </div>
  );
}
