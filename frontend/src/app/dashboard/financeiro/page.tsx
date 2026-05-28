'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart2, Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/services/financial.service';
import { CashFlowChart } from '@/components/financial/CashFlowChart';
import { TransactionList } from '@/components/financial/TransactionList';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

export default function FinanceiroPage() {
  const queryClient = useQueryClient();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial', 'summary'],
    queryFn: financialService.getSummary,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['financial', 'list'],
    queryFn: () => financialService.findAll({ limit: 20, page: 1 }),
  });

  const stats = [
    {
      label: 'Receita Total',
      value: formatCurrency(summary?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Despesas Totais',
      value: formatCurrency(summary?.totalExpenses ?? 0),
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Lucro Líquido',
      value: formatCurrency(summary?.netProfit ?? 0),
      icon: DollarSign,
      color: (summary?.netProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: (summary?.netProfit ?? 0) >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Margem de Lucro',
      value: formatPercentage(summary?.profitMargin ?? 0),
      icon: BarChart2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-slate-400 text-sm mt-1">Controle financeiro e fluxo de caixa</p>
        </div>
        <button
          type="button"
          onClick={() => toast('Formulário em breve', { icon: '🔧' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Transação
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
          >
            <div className={`p-2 rounded-xl ${stat.bg} w-fit mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            {summaryLoading ? (
              <div className="h-8 w-28 bg-slate-800 rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            )}
            <p className="text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Cash Flow Chart */}
      <CashFlowChart months={12} />

      {/* Recent Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-white mb-4">Transações Recentes</h2>
        <TransactionList
          transactions={transactions?.data ?? []}
          isLoading={txLoading}
        />
      </div>
    </div>
  );
}
