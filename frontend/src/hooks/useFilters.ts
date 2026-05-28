'use client';

import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

type FilterValue = string | number | boolean | undefined | null;

interface UseFiltersOptions<T extends Record<string, FilterValue>> {
  initialFilters?: Partial<T>;
  debounceMs?: number;
}

export function useFilters<T extends Record<string, FilterValue>>({
  initialFilters = {} as Partial<T>,
  debounceMs = 300,
}: UseFiltersOptions<T> = {}) {
  const [filters, setFilters] = useState<Partial<T>>(initialFilters);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, debounceMs);

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K] | undefined) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === undefined || value === null || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const clearFilter = useCallback(<K extends keyof T>(key: K) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearch('');
  }, [initialFilters]);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null && v !== '',
  ).length + (search ? 1 : 0);

  return {
    filters,
    search,
    debouncedSearch,
    setFilter,
    setSearch,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
    combinedFilters: { ...filters, ...(debouncedSearch ? { search: debouncedSearch } : {}) },
  };
}
