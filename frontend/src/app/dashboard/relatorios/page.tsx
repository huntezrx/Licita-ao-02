'use client';

import { useDemoStore } from '@/store/demoStore';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }

export default function RelatoriosPage() {
  const { empenhos, licitacoes } = useDemoStore();

  const receita = empenhos.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const lucro = receita - empenhos.reduce((s, e) => s + e.qtd * e.valorCusto, 0);
  const concluidas = licitacoes.filter(l => l.status === 'CONCLUIDA').length;
  const winRate = licitacoes.length > 0 ? ((concluidas / licitacoes.length) * 100).toFixed(0) : '0';

  const topEmpenhos = [...empenhos]
    .sort((a, b) => (b.qtd * b.valorVenda) - (a.qtd * a.valorVenda))
    .slice(0, 5);
  const maxVal = topEmpenhos[0] ? topEmpenhos[0].qtd * topEmpenhos[0].valorVenda : 1;

  const statusGroups = [
    { label: 'Abertas', count: licitacoes.filter(l=>l.status==='ABERTA').length, color: '#4ade80' },
    { label: 'Em Andamento', count: licitacoes.filter(l=>l.status==='EM_ANDAMENTO').length, color: '#60a5fa' },
    { label: 'Concluídas', count: licitacoes.filter(l=>l.status==='CONCLUIDA').length, color: '#7f7f8c' },
    { label: 'Canceladas', count: licitacoes.filter(l=>l.status==='CANCELADA').length, color: '#f87171' },
    { label: 'Suspensas', count: licitacoes.filter(l=>l.status==='SUSPENSA').length, color: '#fbbf24' },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#f0f0f2', letterSpacing: '-0.02em' }}>Relatórios</h1>
        <p className="text-sm mt-0.5" style={{ color: '#44444f' }}>Análise de desempenho</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Total Empenhos', value: empenhos.length, color: '#f0f0f2' },
          { label: 'Receita Total', value: fmt(receita), color: '#f0f0f2' },
          { label: 'Lucro Total', value: fmt(lucro), color: lucro >= 0 ? '#4ade80' : '#f87171' },
          { label: 'Taxa de Conclusão', value: `${winRate}%`, color: '#60a5fa' },
        ].map(k => (
          <div key={k.label} className="surface rounded-xl px-5 py-4">
            <p className="text-[11px]" style={{ color: '#44444f' }}>{k.label}</p>
            <p className="text-2xl font-semibold tabular-nums mt-1.5" style={{ color: k.color, letterSpacing: '-0.02em' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top empenhos */}
        <div className="surface rounded-xl overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>Maiores Empenhos</p>
          </div>
          <div className="p-5 space-y-4">
            {topEmpenhos.map((e, i) => {
              const tv = e.qtd * e.valorVenda;
              const pct = (tv / maxVal) * 100;
              return (
                <div key={e.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#44444f' }}>#{i+1}</span>
                      <span className="text-[12px] truncate" style={{ color: '#b0b0be' }} title={e.item}>{e.item}</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums flex-shrink-0 ml-3" style={{ color: '#f0f0f2' }}>{fmt(tv)}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#3b82f6', opacity: 0.7 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Licitacoes by status */}
        <div className="surface rounded-xl overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>Licitações por Status</p>
          </div>
          <div className="p-5 space-y-3">
            {statusGroups.filter(s => s.count > 0).map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-[13px]" style={{ color: '#7f7f8c' }}>{s.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(s.count / licitacoes.length) * 100}%`, background: s.color, opacity: 0.6 }} />
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums w-4 text-right" style={{ color: '#f0f0f2' }}>{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
