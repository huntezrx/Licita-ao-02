'use client';

import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { Zap } from 'lucide-react';

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/10 rounded-xl">
          <Zap className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline de Vendas</h1>
          <p className="text-slate-400 text-sm">Arraste os cards para mover entre etapas</p>
        </div>
      </div>
      <KanbanBoard />
    </div>
  );
}
