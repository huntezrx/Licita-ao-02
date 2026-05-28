'use client';

import { useDemoStore } from '@/store/demoStore';
import { TrendingUp, TrendingDown, FileText, DollarSign, CheckCircle } from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const { empenhos, licitacoes } = useDemoStore();

  const totalVenda = empenhos.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const totalCusto = empenhos.reduce((s, e) => s + e.qtd * e.valorCusto, 0);
  const lucroTotal = totalVenda - totalCusto;
  const pendentes = empenhos.filter(e => e.status === 'PENDENTE').length;
  const pagos = empenhos.filter(e => e.status === 'PAGO').length;
  const cancelados = empenhos.filter(e => e.status === 'CANCELADO').length;
  const licitacoesAbertas = licitacoes.filter(l => l.status === 'ABERTA' || l.status === 'EM_ANDAMENTO').length;
  const totalLicitacoes = licitacoes.reduce((s, l) => s + l.valorEstimado, 0);

  const recentes = [...empenhos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-title glow-title">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral do sistema de licitações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Empenhos', value: empenhos.length.toString(), sub: `${pagos} pagos · ${pendentes} pendentes`, icon: FileText, color: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/20' },
          { label: 'Receita Total', value: fmt(totalVenda), sub: 'Valor total de venda', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', glow: 'shadow-emerald-500/20' },
          { label: 'Lucro Total', value: fmt(lucroTotal), sub: lucroTotal >= 0 ? 'Resultado positivo' : 'Resultado negativo', icon: lucroTotal >= 0 ? TrendingUp : TrendingDown, color: lucroTotal >= 0 ? 'from-violet-500 to-purple-600' : 'from-red-500 to-red-600', glow: 'shadow-violet-500/20' },
          { label: 'Licitações Ativas', value: licitacoesAbertas.toString(), sub: `${fmt(totalLicitacoes)} estimados`, icon: CheckCircle, color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
        ].map((card) => (
          <div key={card.label} className={`glass-card rounded-2xl p-5 shadow-xl ${card.glow} transition-all duration-300 glass-card-hover`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color}`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pagos', count: pagos, value: empenhos.filter(e => e.status === 'PAGO').reduce((s, e) => s + e.qtd * e.valorVenda, 0), color: 'text-emerald-400', dot: 'bg-emerald-400' },
          { label: 'Pendentes', count: pendentes, value: empenhos.filter(e => e.status === 'PENDENTE').reduce((s, e) => s + e.qtd * e.valorVenda, 0), color: 'text-amber-400', dot: 'bg-amber-400' },
          { label: 'Cancelados', count: cancelados, value: empenhos.filter(e => e.status === 'CANCELADO').reduce((s, e) => s + e.qtd * e.valorVenda, 0), color: 'text-red-400', dot: 'bg-red-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${s.dot}`} />
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-400">{s.label} · {fmt(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Empenhos */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold gradient-title glow-title">Empenhos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Empenho', 'Item', 'Total Venda', 'Total Custo', 'Lucro', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentes.map((e) => {
                const tv = e.qtd * e.valorVenda;
                const tc = e.qtd * e.valorCusto;
                const lucro = tv - tc;
                const prejuizo = e.valorCusto > e.valorVenda;
                return (
                  <tr key={e.id} className={`transition-colors ${prejuizo ? 'bg-red-500/[0.08] hover:bg-red-500/[0.12]' : 'hover:bg-white/[0.03]'}`}>
                    <td className="px-6 py-3 text-sm font-mono text-blue-300">{e.numero}</td>
                    <td className="px-6 py-3 text-sm text-slate-200 max-w-[200px] truncate">{e.item}</td>
                    <td className="px-6 py-3 text-sm text-white font-medium">{fmt(tv)}</td>
                    <td className="px-6 py-3 text-sm text-slate-300">{fmt(tc)}</td>
                    <td className={`px-6 py-3 text-sm font-semibold ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(lucro)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        e.status === 'PAGO' ? 'bg-emerald-500/10 text-emerald-400' :
                        e.status === 'PENDENTE' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{e.status}</span>
                    </td>
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
