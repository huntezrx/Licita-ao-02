'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { LicitationsTable } from '@/components/licitations/LicitationsTable';
import { LicitationForm } from '@/components/licitations/LicitationForm';
import { licitationsService } from '@/services/licitations.service';
import { CreateLicitationFormData } from '@/lib/validators';

export default function LicitacoesPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateLicitationFormData) => licitationsService.create(data),
    onSuccess: () => {
      toast.success('Licitação criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['licitations'] });
      setShowForm(false);
    },
    onError: () => toast.error('Erro ao criar licitação'),
  });

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

      <AnimatePresence>
        {showForm && (
          <LicitationForm
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data);
            }}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
