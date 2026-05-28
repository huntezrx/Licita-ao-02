'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { documentsService } from '@/services/documents.service';
import { DocumentGrid } from '@/components/documents/DocumentGrid';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Document } from '@/types/document.types';
import { useDebounce } from '@/hooks/useDebounce';

export default function DocumentosPage() {
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', { search: debouncedSearch }],
    queryFn: () => documentsService.findAll({ limit: 50, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (doc: Document) => documentsService.remove(doc.id),
    onSuccess: () => {
      toast.success('Documento removido');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Erro ao remover documento'),
  });

  const handleDownload = async (doc: Document) => {
    try {
      const { url } = await documentsService.getDownloadUrl(doc.id);
      window.open(url, '_blank');
    } catch {
      toast.error('Erro ao obter link de download');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documentos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão centralizada de documentos</p>
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors"
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Pesquisar documentos..."
        className="max-w-sm"
      />

      <DocumentGrid
        documents={data?.data ?? []}
        isLoading={isLoading}
        onDownload={handleDownload}
        onDelete={(doc) => setDeleteTarget(doc)}
      />

      <AnimatePresence>
        {showUpload && (
          <DocumentUpload
            onClose={() => setShowUpload(false)}
            onUploaded={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover documento"
        description={`Tem certeza que deseja remover "${deleteTarget?.originalName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
