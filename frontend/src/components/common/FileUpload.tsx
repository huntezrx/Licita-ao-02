'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/formatters';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  onFilesSelected: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
}

interface PreviewFile {
  file: File;
  preview?: string;
  error?: string;
}

export function FileUpload({
  accept = '*/*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10 MB default
  onFilesSelected,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<PreviewFile[]>([]);

  const processFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      const fileArray = Array.from(rawFiles);
      const processed: PreviewFile[] = fileArray.map((file) => {
        if (file.size > maxSize) {
          return { file, error: `Arquivo excede o limite de ${formatFileSize(maxSize)}` };
        }
        if (file.type.startsWith('image/')) {
          return { file, preview: URL.createObjectURL(file) };
        }
        return { file };
      });

      const valid = processed.filter((f) => !f.error);
      setFiles(multiple ? (prev) => [...prev, ...processed] : processed);
      onFilesSelected(valid.map((f) => f.file));
    },
    [maxSize, multiple, onFilesSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
    },
    [processFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const next = prev.filter((_, i) => i !== index);
        onFilesSelected(next.filter((f) => !f.error).map((f) => f.file));
        return next;
      });
    },
    [onFilesSelected],
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-sm text-slate-300 font-medium">
          Arraste arquivos aqui ou <span className="text-blue-400">clique para selecionar</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Tamanho máximo: {formatFileSize(maxSize)}
          {accept !== '*/*' && ` • Tipos aceitos: ${accept}`}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                item.error ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800 bg-slate-900'
              }`}
            >
              {item.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.preview} alt={item.file.name} className="w-8 h-8 rounded object-cover" />
              ) : item.error ? (
                <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              ) : (
                <FileText className="w-8 h-8 text-slate-400 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.file.name}</p>
                {item.error ? (
                  <p className="text-xs text-red-400">{item.error}</p>
                ) : (
                  <p className="text-xs text-slate-400">{formatFileSize(item.file.size)}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
