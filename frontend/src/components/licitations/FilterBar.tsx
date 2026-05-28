'use client';

import { Filter, X } from 'lucide-react';
import { SearchInput } from '@/components/common/SearchInput';
import { LICITATION_STATUS_LABELS, MODALITY_LABELS } from '@/lib/constants';
import { LicitationStatus, LicitationModality } from '@/types/licitation.types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: LicitationStatus | undefined;
  onStatusChange: (status: LicitationStatus | undefined) => void;
  modality: LicitationModality | undefined;
  onModalityChange: (modality: LicitationModality | undefined) => void;
  activeFilterCount: number;
  onClearAll: () => void;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  modality,
  onModalityChange,
  activeFilterCount,
  onClearAll,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar licitações..."
        className="flex-1 min-w-[200px] max-w-sm"
      />

      {/* Status Filter */}
      <select
        value={status ?? ''}
        onChange={(e) => onStatusChange((e.target.value as LicitationStatus) || undefined)}
        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
      >
        <option value="">Todos os status</option>
        {Object.entries(LICITATION_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Modality Filter */}
      <select
        value={modality ?? ''}
        onChange={(e) => onModalityChange((e.target.value as LicitationModality) || undefined)}
        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
      >
        <option value="">Todas as modalidades</option>
        {Object.entries(MODALITY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-sm transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpar ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
