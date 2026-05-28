'use client';

import { useDemoStore } from '@/store/demoStore';
import { TrendingUp, TrendingDown, FileSignature, CheckCircle2 } from 'lucide-react';

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
  const licitacoesAtivas = licitacoes.filter(l => l.status === 'ABERTA' || l.status === 'EM_ANDAMENTO').length;
  const totalLicitacoes = licitacoes.reduce((s, l) => s + l.valorEstimado, 0);
  const recentes = [...empenhos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-5xl font-black gradient-title glow-title tracking-tight leading-none">Dashboard</h1>
        <p className="text-slate-500 mt-2 text-sm">Visão geral do sistema de licitações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Empenhos */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Empenhos</p>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <FileSignature className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{empenhos.length}</p>
          <p className="text-xs text-slate-500 mt-1">{pagos} pagos · {pendentes} pendentes</p>
        </div>

        {/* Receita Total */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Receita Total</p>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: '#00ff88' }} />
            </div>
          </div>
          <p className="text-3xl font-black" style={{ color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)' }}>{fmt(totalVenda)}</p>
          <p className="text-xs text-slate-500 mt-1">Valor total de venda</p>
        </div>

        {/* Lucro Total */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Lucro</p>
            <div className="p-2 rounded-lg" style={{
              background: lucroTotal >= 0 ? 'rgba(0,255,136,0.08)' : 'rgba(255,56,96,0.08)',
              border: lucroTotal >= 0 ? '1px solid rgba(0,255,136,0.15)' : '1px solid rgba(255,56,96,0.15)',
            }}>
              {lucroTotal >= 0
                ? <TrendingUp className="w-4 h-4" style={{ color: '#00ff88' }} />
                : <TrendingDown className="w-4 h-4" style={{ color: '#ff3860' }} />
              }
            </div>
          </div>
          <p className="text-3xl font-black" style={{
            color: lucroTotal >= 0 ? '#00ff88' : '#ff3860',
            textShadow: lucroTotal >= 0 ? '0 0 10px rgba(0,255,136,0.4)' : '0 0 10px rgba(255,56,96,0.4)',
          }}>{fmt(lucroTotal)}</p>
          <p className="text-xs text-slate-500 mt-1">{lucroTotal >= 0 ? 'Resultado positivo' : 'Resultado negativo'}</p>
        </div>

        {/* Licitações Ativas */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Licitações Ativas</p>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <p className="text-4xl font-black text-cyan-300">{licitacoesAtivas}</p>
          <p className="text-xs text-slate-500 mt-1">{fmt(totalLicitacoes)} estimados</p>
        </div>
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Empenhos Pagos', count: pagos, value: empenhos.filter(e => e.status === 'PAGO').reduce((s, e) => s + e.qtd * e.valorVenda, 0), color: '#00ff88', glow: 'rgba(0,255,136,0.3)' },
          { label: 'Pendentes', count: pendentes, value: empenhos.filter(e => e.status === 'PENDENTE').reduce((s, e) => s + e.qtd * e.valorVenda, 0), color: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
          { label: 'Cancelados', count: cancelados, value: empenhos.filter(e => e.status === 'CANCELADO').reduce((s, e) => s + e.qtd * e.valorVenda, 0), color: '#ff3860', glow: 'rgba(255,56,96,0.3)' },
        ].map((s) => (
          <div key={s.label} className="neo-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 8px ${s.glow}` }} />
            <div>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label} · {fmt(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Empenhos */}
      <div className="neo-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-lg font-black gradient-title tracking-tight">Empenhos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Empenho', 'Item', 'Total Venda', 'Total Custo', 'Lucro', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentes.map((e) => {
                const tv = e.qtd * e.valorVenda;
                const tc = e.qtd * e.valorCusto;
                const lucro = tv - tc;
                const prejuizo = e.valorCusto > e.valorVenda;
                return (
                  <tr key={e.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: prejuizo ? 'rgba(255,56,96,0.04)' : 'transparent' }}>
                    <td className="px-6 py-3.5 text-xs font-mono" style={{ color: '#a78bfa' }}>{e.numero}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-300 max-w-[200px] truncate">{e.item}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-white">{fmt(tv)}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-400">{fmt(tc)}</td>
                    <td className="px-6 py-3.5 text-sm font-bold" style={{
                      color: lucro >= 0 ? '#00ff88' : '#ff3860',
                      textShadow: lucro >= 0 ? '0 0 6px rgba(0,255,136,0.4)' : '0 0 6px rgba(255,56,96,0.4)',
                    }}>{fmt(lucro)}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                        background: e.status === 'PAGO' ? 'rgba(0,255,136,0.1)' : e.status === 'PENDENTE' ? 'rgba(251,191,36,0.1)' : 'rgba(255,56,96,0.1)',
                        color: e.status === 'PAGO' ? '#00ff88' : e.status === 'PENDENTE' ? '#fbbf24' : '#ff3860',
                        border: `1px solid ${e.status === 'PAGO' ? 'rgba(0,255,136,0.2)' : e.status === 'PENDENTE' ? 'rgba(251,191,36,0.2)' : 'rgba(255,56,96,0.2)'}`,
                      }}>{e.status}</span>
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
