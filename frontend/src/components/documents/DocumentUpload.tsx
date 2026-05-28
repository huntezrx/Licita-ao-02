'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FileUpload } from '@/components/common/FileUpload';
import { Document } from '@/types/document.types';
import { documentsService } from '@/services/documents.service';

const CATEGORY_OPTIONS: { value: Document['category']; label: string }[] = [
  { value: 'EDITAL', label: 'Edital' },
  { value: 'PROPOSTA', label: 'Proposta' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'ADITIVO', label: 'Aditivo' },
  { value: 'NOTA_FISCAL', label: 'Nota Fiscal' },
  { value: 'CERTIDAO', label: 'Certidão' },
  { value: 'RELATORIO', label: 'Relatório' },
  { value: 'ATA', label: 'Ata' },
  { value: 'OUTROS', label: 'Outros' },
];

interface DocumentUploadProps {
  onClose: () => void;
  onUploaded: (doc: Document) => void;
  licitationId?: string;
  contractId?: string;
  proposalId?: string;
}

export function DocumentUpload({
  onClose,
  onUploaded,
  licitationId,
  contractId,
  proposalId,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<Document['category']>('OUTROS');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Selecione ao menos um arquivo');
      return;
    }

    setIsUploading(true);
    try {
      for (const file of files) {
        const doc = await documentsService.upload(file, {
          category,
          licitationId,
          contractId,
          proposalId,
          notes: notes || undefined,
        });
        onUploaded(doc);
      }
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso`);
      onClose();
    } catch {
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Upload de Documentos</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <FileUpload
            multiple
            maxSize={50 * 1024 * 1024} // 50 MB
            onFilesSelected={setFiles}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Document['category'])}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas sobre o(s) documento(s)..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-xl transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Enviar {files.length > 0 ? `(${files.length})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
