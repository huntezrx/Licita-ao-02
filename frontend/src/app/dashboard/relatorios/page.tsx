'use client';

import { useDemoStore } from '@/store/demoStore';
import { BarChart2, TrendingUp, FileText, Download, Award } from 'lucide-react';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function RelatoriosPage() {
  const { empenhos, licitacoes } = useDemoStore();

  const totalVenda = empenhos.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const totalCusto = empenhos.reduce((s, e) => s + e.qtd * e.valorCusto, 0);
  const lucro = totalVenda - totalCusto;
  const margem = totalVenda > 0 ? (lucro / totalVenda * 100).toFixed(1) : '0.0';
  const totalLic = licitacoes.reduce((s, l) => s + l.valorEstimado, 0);
  const licConcluidas = licitacoes.filter(l => l.status === 'CONCLUIDA').length;
  const taxaSucesso = licitacoes.length > 0 ? ((licConcluidas / licitacoes.length) * 100).toFixed(0) : '0';

  const topEmpenhos = [...empenhos].sort((a, b) => (b.qtd * b.valorVenda) - (a.qtd * a.valorVenda)).slice(0, 5);
  const maxVal = topEmpenhos[0] ? topEmpenhos[0].qtd * topEmpenhos[0].valorVenda : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black gradient-title glow-title tracking-tight leading-none">Relatórios</h1>
          <p className="text-slate-500 mt-2 text-sm">Análise de desempenho e indicadores</p>
        </div>
        <button onClick={() => alert('Exportação disponível na versão com backend')} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-neon text-white text-sm transition-all">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: fmt(totalVenda), icon: TrendingUp, style: { color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)' }, iconStyle: { background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)' }, iconColor: '#00ff88' },
          { label: 'Margem de Lucro', value: `${margem}%`, icon: BarChart2, style: parseFloat(margem) >= 15 ? { color: '#00ff88' } : { color: '#fbbf24' }, iconStyle: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }, iconColor: '#a78bfa' },
          { label: 'Total Licitações', value: fmt(totalLic), icon: FileText, style: { color: '#a78bfa' }, iconStyle: { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }, iconColor: '#a78bfa' },
          { label: 'Taxa de Sucesso', value: `${taxaSucesso}%`, icon: Award, style: { color: '#00ff88' }, iconStyle: { background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)' }, iconColor: '#00ff88' },
        ].map(c => (
          <div key={c.label} className="neo-card rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl" style={c.iconStyle}><c.icon className="w-5 h-5" style={{ color: c.iconColor }} /></div>
            <div>
              <p className="text-xs text-slate-400">{c.label}</p>
              <p className="text-xl font-bold" style={c.style}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart - top empenhos */}
      <div className="neo-card rounded-2xl p-6">
        <h2 className="font-semibold gradient-title mb-6">Top 5 Empenhos por Valor</h2>
        <div className="space-y-4">
          {topEmpenhos.map((e) => {
            const val = e.qtd * e.valorVenda;
            const width = (val / maxVal) * 100;
            const lucroE = e.qtd * (e.valorVenda - e.valorCusto);
            return (
              <div key={e.id}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">{e.numero} — {e.item.substring(0, 40)}{e.item.length > 40 ? '...' : ''}</span>
                  <span className="text-white font-bold">{fmt(val)}</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${width}%`, background: lucroE >= 0 ? 'linear-gradient(90deg, #7c3aed, #2563eb)' : 'linear-gradient(90deg, #ff3860, #ff6b6b)' }}
                  />
                </div>
                <p className="text-xs mt-1" style={lucroE >= 0 ? { color: '#00ff88' } : { color: '#ff3860' }}>Lucro: {fmt(lucroE)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Licitações por status */}
      <div className="neo-card rounded-2xl p-6">
        <h2 className="font-semibold gradient-title mb-4">Licitações por Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { status: 'ABERTA', label: 'Abertas', style: { color: '#67e8f9' }, bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.15)' },
            { status: 'EM_ANDAMENTO', label: 'Em Andamento', style: { color: '#a78bfa' }, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
            { status: 'CONCLUIDA', label: 'Concluídas', style: { color: '#00ff88' }, bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.15)' },
            { status: 'SUSPENSA', label: 'Suspensas', style: { color: '#fbbf24' }, bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)' },
            { status: 'CANCELADA', label: 'Canceladas', style: { color: '#ff3860' }, bg: 'rgba(255,56,96,0.08)', border: 'rgba(255,56,96,0.15)' },
          ].map(({ status, label, style, bg, border }) => {
            const count = licitacoes.filter(l => l.status === status).length;
            return (
              <div key={status} className="rounded-xl p-4 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
                <p className="text-2xl font-bold" style={style}>{count}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
