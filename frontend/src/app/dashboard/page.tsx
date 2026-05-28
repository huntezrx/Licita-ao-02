'use client';

import Link from 'next/link';
import { FileSignature, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const mockEmpenhos = [
  { id: '2024NE001', item: 'Material de Escritório', und: 'UN', marca: 'Staples', qtd: 100, valorVenda: 25.00, qtdEntregue: 100, valorCusto: 18.00, status: 'PAGO', nf: '001234', lucro: 700 },
  { id: '2024NE002', item: 'Equipamento de TI - Notebook', und: 'UN', marca: 'Dell', qtd: 5, valorVenda: 4500.00, qtdEntregue: 3, valorCusto: 3800.00, status: 'PENDENTE', nf: '', lucro: 3500 },
  { id: '2024NE003', item: 'Cadeiras Ergonômicas', und: 'UN', marca: 'Herman Miller', qtd: 20, valorVenda: 850.00, qtdEntregue: 20, valorCusto: 920.00, status: 'PENDENTE', nf: '001235', lucro: -1400 },
  { id: '2024NE004', item: 'Papel A4 Resma 500fls', und: 'PCT', marca: 'Chamex', qtd: 200, valorVenda: 28.00, qtdEntregue: 200, valorCusto: 21.00, status: 'PAGO', nf: '001236', lucro: 1400 },
  { id: '2024NE005', item: 'Canetas BIC Azul', und: 'CX', marca: 'BIC', qtd: 50, valorVenda: 35.00, qtdEntregue: 0, valorCusto: 28.00, status: 'CANCELADO', nf: '', lucro: 0 },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const totalEmpenhos = mockEmpenhos.length;
  const receitaTotal = mockEmpenhos.reduce((sum, e) => sum + e.qtd * e.valorVenda, 0);
  const custoTotal = mockEmpenhos.reduce((sum, e) => sum + e.qtd * e.valorCusto, 0);
  const lucroTotal = receitaTotal - custoTotal;
  const empenhosPendentes = mockEmpenhos.filter((e) => e.status === 'PENDENTE').length;

  const pagos = mockEmpenhos.filter((e) => e.status === 'PAGO');
  const pendentes = mockEmpenhos.filter((e) => e.status === 'PENDENTE');
  const cancelados = mockEmpenhos.filter((e) => e.status === 'CANCELADO');

  const receitaPagos = pagos.reduce((sum, e) => sum + e.qtd * e.valorVenda, 0);
  const receitaPendentes = pendentes.reduce((sum, e) => sum + e.qtd * e.valorVenda, 0);
  const receitaCancelados = cancelados.reduce((sum, e) => sum + e.qtd * e.valorVenda, 0);

  const recentEmpenhos = mockEmpenhos.slice(0, 5);

  const statusBadge = (status: string) => {
    if (status === 'PAGO') return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">PAGO</span>;
    if (status === 'PENDENTE') return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">PENDENTE</span>;
    return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">CANCELADO</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 border border-blue-500/20 rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white mb-1">Painel de Empenhos</h2>
        <p className="text-slate-400 text-sm">
          Visão geral dos empenhos e indicadores financeiros.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Total Empenhos</p>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileSignature className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalEmpenhos}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Receita Total</p>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(receitaTotal)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Lucro Total</p>
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(lucroTotal)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Empenhos Pendentes</p>
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{empenhosPendentes}</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-400">PAGOS</p>
          </div>
          <p className="text-2xl font-bold text-white">{pagos.length} empenhos</p>
          <p className="text-sm text-slate-400 mt-1">{formatCurrency(receitaPagos)}</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-sm font-semibold text-amber-400">PENDENTES</p>
          </div>
          <p className="text-2xl font-bold text-white">{pendentes.length} empenhos</p>
          <p className="text-sm text-slate-400 mt-1">{formatCurrency(receitaPendentes)}</p>
        </div>

        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm font-semibold text-red-400">CANCELADOS</p>
          </div>
          <p className="text-2xl font-bold text-white">{cancelados.length} empenhos</p>
          <p className="text-sm text-slate-400 mt-1">{formatCurrency(receitaCancelados)}</p>
        </div>
      </div>

      {/* Recent Empenhos Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Empenhos Recentes</h3>
          <Link
            href="/dashboard/empenhos"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Empenho</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Item</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Vlr Venda</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Custo</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Lucro</th>
                <th className="text-center py-2 px-3 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmpenhos.map((emp) => {
                const isCostHigh = emp.valorCusto > emp.valorVenda;
                const totalVenda = emp.qtd * emp.valorVenda;
                const totalCusto = emp.qtd * emp.valorCusto;
                const lucro = totalVenda - totalCusto;
                return (
                  <tr
                    key={emp.id}
                    className={`border-b border-slate-800/50 ${isCostHigh ? 'bg-red-950/30' : 'hover:bg-slate-800/30'}`}
                  >
                    <td className="py-3 px-3 text-white font-mono text-xs">{emp.id}</td>
                    <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">{emp.item}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(totalVenda)}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(totalCusto)}</td>
                    <td className={`py-3 px-3 text-right font-semibold ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(lucro)}
                    </td>
                    <td className="py-3 px-3 text-center">{statusBadge(emp.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
