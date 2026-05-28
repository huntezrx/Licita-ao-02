'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, Upload, Search, File, Download } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: string;
  uploadedBy: { id: string; name: string } | null;
}

export default function DocumentosPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<Document>>>('/documents', {
        params: { limit: 50, search: search || undefined },
      });
      return response.data.data;
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documentos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão centralizada de documentos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar documentos..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-800 rounded-xl mb-3" />
              <div className="h-3 bg-slate-800 rounded w-3/4 mb-2" />
              <div className="h-2 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.data.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <File className="w-5 h-5 text-blue-400" />
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <p className="text-sm font-medium text-white line-clamp-1 mb-1">{doc.name}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{formatFileSize(doc.size)}</span>
                <span>{formatDate(doc.createdAt)}</span>
              </div>
              {doc.uploadedBy && (
                <p className="text-xs text-slate-600 mt-1">por {doc.uploadedBy.name}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
