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
          <h1 className="text-3xl font-bold gradient-title glow-title">Relatórios</h1>
          <p className="text-slate-400 mt-1">Análise de desempenho e indicadores</p>
        </div>
        <button onClick={() => alert('Exportação disponível na versão com backend')} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-slate-300 hover:text-white text-sm transition-all">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: fmt(totalVenda), icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
          { label: 'Margem de Lucro', value: `${margem}%`, icon: BarChart2, color: parseFloat(margem) >= 15 ? 'from-emerald-500 to-emerald-600' : 'from-amber-500 to-orange-500' },
          { label: 'Total Licitações', value: fmt(totalLic), icon: FileText, color: 'from-violet-500 to-purple-600' },
          { label: 'Taxa de Sucesso', value: `${taxaSucesso}%`, icon: Award, color: 'from-emerald-500 to-teal-600' },
        ].map(c => (
          <div key={c.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${c.color}`}><c.icon className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs text-slate-400">{c.label}</p>
              <p className="text-xl font-bold text-white">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart - top empenhos */}
      <div className="glass-card rounded-2xl p-6">
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
                    className={`h-full rounded-full bg-gradient-to-r ${lucroE >= 0 ? 'from-violet-500 to-blue-500' : 'from-red-500 to-red-600'} transition-all`}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${lucroE >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Lucro: {fmt(lucroE)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Licitações por status */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-semibold gradient-title mb-4">Licitações por Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { status: 'ABERTA', label: 'Abertas', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { status: 'EM_ANDAMENTO', label: 'Em Andamento', color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { status: 'CONCLUIDA', label: 'Concluídas', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { status: 'SUSPENSA', label: 'Suspensas', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { status: 'CANCELADA', label: 'Canceladas', color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(({ status, label, color, bg }) => {
            const count = licitacoes.filter(l => l.status === status).length;
            return (
              <div key={status} className={`${bg} rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
