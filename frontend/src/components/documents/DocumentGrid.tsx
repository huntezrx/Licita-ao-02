'use client';

import { FileText, FileImage, File, Download, Trash2, ExternalLink } from 'lucide-react';
import { Document } from '@/types/document.types';
import { formatFileSize, formatDate } from '@/lib/formatters';

const CATEGORY_LABELS: Record<string, string> = {
  EDITAL: 'Edital',
  PROPOSTA: 'Proposta',
  CONTRATO: 'Contrato',
  ADITIVO: 'Aditivo',
  NOTA_FISCAL: 'Nota Fiscal',
  CERTIDAO: 'Certidão',
  RELATORIO: 'Relatório',
  ATA: 'Ata',
  OUTROS: 'Outros',
};

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <FileImage className="w-8 h-8 text-blue-400" />;
  if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-red-400" />;
  return <File className="w-8 h-8 text-slate-400" />;
}

interface DocumentGridProps {
  documents: Document[];
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  isLoading?: boolean;
}

export function DocumentGrid({ documents, onDownload, onDelete, isLoading }: DocumentGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-40 bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">
        <File className="w-10 h-10 mx-auto mb-3 text-slate-700" />
        Nenhum documento encontrado
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="group bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors"
        >
          {/* Icon */}
          <div className="flex items-center justify-center h-16 mb-3">
            <FileIcon mimeType={doc.mimeType} />
          </div>

          {/* Name */}
          <p className="text-xs font-medium text-white text-center truncate mb-1" title={doc.originalName}>
            {doc.originalName}
          </p>

          {/* Meta */}
          <p className="text-xs text-slate-500 text-center mb-1">
            {CATEGORY_LABELS[doc.category] ?? doc.category}
          </p>
          <p className="text-xs text-slate-600 text-center">
            {formatFileSize(doc.size)} · {formatDate(doc.createdAt)}
          </p>

          {/* Actions (shown on hover) */}
          <div className="flex items-center justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onDownload(doc)}
              className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
              title="Baixar"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            {doc.downloadUrl && (
              <a
                href={doc.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg transition-colors"
                title="Abrir"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onDelete(doc)}
              className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
              title="Remover"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
