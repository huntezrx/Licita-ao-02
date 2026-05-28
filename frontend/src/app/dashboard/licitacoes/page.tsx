'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { LicitationsTable } from '@/components/licitations/LicitationsTable';
import { EmptyState } from '@/components/common/EmptyState';

export default function LicitacoesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Licitações</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie todas as licitações públicas
          </p>
        </div>
      </div>

      <LicitationsTable onNewLicitation={() => setShowForm(true)} />
    </div>
  );
}
