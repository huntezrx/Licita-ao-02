'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Financial } from '@/types/financial.types';
import { formatCurrency, formatDate } from '@/lib/formatters';

const CATEGORY_LABELS: Record<string, string> = {
  CONTRACT_PAYMENT: 'Pagamento de Contrato',
  PROPOSAL_FEE: 'Taxa de Proposta',
  CONSULTING: 'Consultoria',
  OPERATIONAL: 'Operacional',
  PERSONNEL: 'Pessoal',
  TAXES: 'Impostos',
  TRAVEL: 'Viagens',
  EQUIPMENT: 'Equipamentos',
  SOFTWARE: 'Software',
  OTHER: 'Outros',
};

interface TransactionListProps {
  transactions: Financial[];
  isLoading?: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
        >
          <div
            className={`p-1.5 rounded-lg flex-shrink-0 ${
              t.type === 'REVENUE' ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}
          >
            {t.type === 'REVENUE' ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{t.description}</p>
            <p className="text-xs text-slate-400">
              {CATEGORY_LABELS[t.category] ?? t.category} · {formatDate(t.date)}
            </p>
          </div>

          <span
            className={`text-sm font-semibold flex-shrink-0 ${
              t.type === 'REVENUE' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {t.type === 'REVENUE' ? '+' : '-'}
            {formatCurrency(t.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
