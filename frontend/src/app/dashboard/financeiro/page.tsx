'use client';

import { useDemoStore } from '@/store/demoStore';
import { AlertTriangle } from 'lucide-react';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }

export default function FinanceiroPage() {
  const { empenhos } = useDemoStore();

  const pagos = empenhos.filter(e => e.status === 'PAGO');
  const pendentes = empenhos.filter(e => e.status === 'PENDENTE');
  const alertas = empenhos.filter(e => e.itens.some(i => i.valorCusto > i.valorVenda));

  const eTv = (e: typeof empenhos[0]) => e.itens.reduce((s, i) => s + i.qtd * i.valorVenda, 0);
  const eTc = (e: typeof empenhos[0]) => e.itens.reduce((s, i) => s + i.qtd * i.valorCusto, 0);
  const receita = empenhos.reduce((s, e) => s + eTv(e), 0);
  const custo = empenhos.reduce((s, e) => s + eTc(e), 0);
  const lucro = receita - custo;
  const aReceber = pendentes.reduce((s, e) => s + eTv(e), 0);
  const margem = receita > 0 ? ((lucro / receita) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#111827', letterSpacing: '-0.02em' }}>Financeiro</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Análise financeira dos empenhos</p>
      </div>

      {alertas.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#fca5a5' }}>
              {alertas.length} empenho{alertas.length > 1 ? 's' : ''} com custo acima do valor de venda
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: '#7f7f8c' }}>{alertas.map(e => e.numero).join(', ')}</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Receita Total', value: fmt(receita), sub: `${empenhos.length} empenhos`, color: '#f0f0f2' },
          { label: 'Custo Total', value: fmt(custo), sub: 'Valor de aquisição', color: '#7f7f8c' },
          { label: 'Lucro Líquido', value: fmt(lucro), sub: `Margem ${margem}%`, color: lucro >= 0 ? '#4ade80' : '#f87171' },
          { label: 'A Receber', value: fmt(aReceber), sub: `${pendentes.length} pendentes`, color: '#fbbf24' },
        ].map(k => (
          <div key={k.label} className="surface rounded-xl px-5 py-4">
            <p className="text-[11px]" style={{ color: '#44444f' }}>{k.label}</p>
            <p className="text-2xl font-semibold tabular-nums mt-1.5" style={{ color: k.color, letterSpacing: '-0.02em' }}>{k.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#44444f' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pagos */}
        <div className="surface rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>Pagos</p>
            <span className="badge-success inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium">{pagos.length}</span>
          </div>
          <div>
            {pagos.length === 0 && <p className="text-center py-8 text-[12px]" style={{ color: '#44444f' }}>Nenhum empenho pago</p>}
            {pagos.map(e => {
              const tv = eTv(e);
              const lucroItem = tv - eTc(e);
              return (
                <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div>
                    <p className="text-[11px] font-mono" style={{ color: '#60a5fa' }}>{e.numero}</p>
                    <p className="text-[12px] max-w-[180px] truncate" style={{ color: '#6b7280' }} title={e.fornecedor}>{e.fornecedor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold tabular-nums" style={{ color: '#111827' }}>{fmt(tv)}</p>
                    <p className="text-[11px] tabular-nums" style={{ color: lucroItem >= 0 ? '#4ade80' : '#f87171' }}>
                      {lucroItem >= 0 ? '+' : ''}{fmt(lucroItem)}
                    </p>
                  </div>
                </div>
              );
            })}
            {pagos.length > 0 && (
              <div className="flex justify-between px-5 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-[11px]" style={{ color: '#9ca3af' }}>Total recebido</span>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: '#16a34a' }}>{fmt(pagos.reduce((s,e) => s+eTv(e),0))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pendentes */}
        <div className="surface rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>Pendentes</p>
            <span className="badge-warning inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium">{pendentes.length}</span>
          </div>
          <div>
            {pendentes.length === 0 && <p className="text-center py-8 text-[12px]" style={{ color: '#44444f' }}>Nenhum empenho pendente</p>}
            {pendentes.map(e => {
              const tv = eTv(e);
              const alerta = e.itens.some(i => i.valorCusto > i.valorVenda);
              return (
                <div key={e.id} className="flex items-center justify-between px-5 py-3 transition-colors" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: alerta ? 'rgba(248,113,113,0.03)' : undefined }}>
                  <div>
                    <p className="text-[11px] font-mono flex items-center gap-1" style={{ color: '#60a5fa' }}>
                      {alerta && <AlertTriangle className="w-2.5 h-2.5" style={{ color: '#f87171' }} />}
                      {e.numero}
                    </p>
                    <p className="text-[12px] max-w-[180px] truncate" style={{ color: '#6b7280' }} title={e.fornecedor}>{e.fornecedor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold tabular-nums" style={{ color: '#fbbf24' }}>{fmt(tv)}</p>
                    <p className="text-[10px]" style={{ color: '#44444f' }}>a receber</p>
                  </div>
                </div>
              );
            })}
            {pendentes.length > 0 && (
              <div className="flex justify-between px-5 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-[11px]" style={{ color: '#9ca3af' }}>Total a receber</span>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: '#d97706' }}>{fmt(aReceber)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
