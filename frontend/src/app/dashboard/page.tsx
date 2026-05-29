'use client';

import { useEffect } from 'react';
import { useDemoStore } from '@/store/demoStore';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function fmtNum(v: number) {
  return v.toLocaleString('pt-BR');
}

export default function DashboardPage() {
  const { empenhos, licitacoes, loadFromDB } = useDemoStore();
  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  function empenhoTv(e: typeof empenhos[0]) { return e.itens.reduce((s, i) => s + i.qtd * i.valorVenda, 0); }
  function empenhoCusto(e: typeof empenhos[0]) { return e.itens.reduce((s, i) => s + i.qtd * i.valorCusto, 0); }
  const receita = empenhos.reduce((s, e) => s + empenhoTv(e), 0);
  const custo = empenhos.reduce((s, e) => s + empenhoCusto(e), 0);
  const lucro = receita - custo;
  const margem = receita > 0 ? ((lucro / receita) * 100).toFixed(1) : '0.0';
  const pendentes = empenhos.filter(e => e.status === 'PENDENTE');
  const pagos = empenhos.filter(e => e.status === 'ENTREGA_TOTAL');
  const aReceber = pendentes.reduce((s, e) => s + empenhoTv(e), 0);
  const ativas = licitacoes.filter(l => l.status === 'ABERTA' || l.status === 'EM_ANDAMENTO');
  const recentes = [...empenhos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const kpis = [
    { label: 'Receita Total', value: fmtBRL(receita), sub: `${empenhos.length} empenhos`, positive: true },
    { label: 'Lucro Líquido', value: fmtBRL(lucro), sub: `Margem ${margem}%`, positive: lucro >= 0 },
    { label: 'A Receber', value: fmtBRL(aReceber), sub: `${pendentes.length} pendentes`, neutral: true },
    { label: 'Licitações Ativas', value: fmtNum(ativas.length), sub: `de ${licitacoes.length} total`, neutral: true },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#111827', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Maio 2026</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="surface surface-hover rounded-xl p-5">
            <p className="text-[11px] font-medium" style={{ color: '#44444f', letterSpacing: '0.02em' }}>{k.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums" style={{
              color: k.neutral ? '#111827' : k.positive ? '#16a34a' : '#dc2626',
              letterSpacing: '-0.02em',
            }}>{k.value}</p>
            <p className="mt-1 text-xs" style={{ color: '#9ca3af' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Entrega Total', count: pagos.length, value: pagos.reduce((s,e) => s+empenhoTv(e),0), color: '#16a34a' },
          { label: 'Pendentes', count: pendentes.length, value: aReceber, color: '#d97706' },
          { label: 'Cancelados', count: empenhos.filter(e=>e.status==='CANCELADO').length, value: empenhos.filter(e=>e.status==='CANCELADO').reduce((s,e)=>s+empenhoTv(e),0), color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="surface rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold tabular-nums" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[11px] truncate" style={{ color: '#9ca3af' }}>{s.label} · {fmtBRL(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent empenhos */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>Empenhos Recentes</p>
          <Link href="/dashboard/empenhos" className="flex items-center gap-1 text-xs transition-colors" style={{ color: '#3b82f6' }}>
            Ver todos <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full table-premium">
          <thead>
            <tr>
              <th>Empenho</th>
              <th>Item</th>
              <th>Receita</th>
              <th>Lucro</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentes.map(e => {
              const tv = empenhoTv(e);
              const lucroItem = tv - empenhoCusto(e);
              const statusMap: Record<string, { label: string; cls: string }> = {
                PENDENTE: { label: 'Pendente', cls: 'badge-warning' },
                EM_ENTREGA: { label: 'Em Entrega', cls: 'badge-blue' },
                ENTREGA_PARCIAL: { label: 'Entrega Parcial', cls: 'badge-warning' },
                ENTREGA_TOTAL: { label: 'Entrega Total', cls: 'badge-success' },
                CANCELADO: { label: 'Cancelado', cls: 'badge-danger' },
              };
              const st = statusMap[e.status];
              return (
                <tr key={e.id}>
                  <td><span className="font-mono text-[12px]" style={{ color: '#2563eb' }}>{e.numero}</span></td>
                  <td className="max-w-[180px] truncate" title={e.fornecedor}>{e.fornecedor}</td>
                  <td className="tabular-nums" style={{ color: '#111827' }}>{fmtBRL(tv)}</td>
                  <td className="tabular-nums font-medium" style={{ color: lucroItem >= 0 ? '#16a34a' : '#dc2626' }}>{fmtBRL(lucroItem)}</td>
                  <td><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${st.cls}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
