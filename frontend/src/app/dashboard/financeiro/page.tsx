'use client';

import { useDemoStore } from '@/store/demoStore';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function FinanceiroPage() {
  const { empenhos } = useDemoStore();

  const pagos = empenhos.filter(e => e.status === 'PAGO');
  const pendentes = empenhos.filter(e => e.status === 'PENDENTE');

  const receitaTotal = empenhos.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const custoTotal = empenhos.reduce((s, e) => s + e.qtd * e.valorCusto, 0);
  const lucroTotal = receitaTotal - custoTotal;
  const receitaPaga = pagos.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const receitaPendente = pendentes.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const margem = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;
  const alertas = empenhos.filter(e => e.valorCusto > e.valorVenda);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-5xl font-black gradient-title glow-title tracking-tight leading-none">Financeiro</h1>
        <p className="text-slate-500 mt-2 text-sm">Resumo financeiro dos empenhos</p>
      </div>

      {alertas.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,56,96,0.08)', border: '1px solid rgba(255,56,96,0.2)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ff3860' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#ff3860' }}>Atenção: {alertas.length} empenho(s) com custo maior que venda</p>
            <p className="text-xs text-slate-400 mt-0.5">{alertas.map(e => e.numero).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400">Receita Total</p>
              <p className="text-xl font-bold mt-1" style={{ color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)' }}>{fmt(receitaTotal)}</p>
              <p className="text-xs text-slate-500 mt-1">Todos os empenhos</p>
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)' }}>
              <DollarSign className="w-4 h-4" style={{ color: '#00ff88' }} />
            </div>
          </div>
        </div>

        {/* Custo Total */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400">Custo Total</p>
              <p className="text-xl font-bold text-white mt-1">{fmt(custoTotal)}</p>
              <p className="text-xs text-slate-500 mt-1">Total investido</p>
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }}>
              <TrendingDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Lucro Bruto */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400">Lucro Bruto</p>
              <p className="text-xl font-bold mt-1" style={lucroTotal >= 0 ? { color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)' } : { color: '#ff3860', textShadow: '0 0 10px rgba(255,56,96,0.4)' }}>{fmt(lucroTotal)}</p>
              <p className="text-xs text-slate-500 mt-1">Margem: {margem.toFixed(1)}%</p>
            </div>
            <div className="p-2.5 rounded-xl" style={lucroTotal >= 0 ? { background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)' } : { background: 'rgba(255,56,96,0.08)', border: '1px solid rgba(255,56,96,0.15)' }}>
              {lucroTotal >= 0
                ? <TrendingUp className="w-4 h-4" style={{ color: '#00ff88' }} />
                : <TrendingDown className="w-4 h-4" style={{ color: '#ff3860' }} />
              }
            </div>
          </div>
        </div>

        {/* A Receber */}
        <div className="neo-card rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400">A Receber</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{fmt(receitaPendente)}</p>
              <p className="text-xs text-slate-500 mt-1">{pendentes.length} empenhos</p>
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received */}
        <div className="neo-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-semibold gradient-title">Empenhos Pagos</h2>
          </div>
          <div>
            {pagos.map(e => {
              const lucroItem = e.qtd * (e.valorVenda - e.valorCusto);
              return (
                <div key={e.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p className="text-sm font-medium text-white">{e.numero}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.item}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#00ff88' }}>{fmt(e.qtd * e.valorVenda)}</p>
                    <p className="text-xs" style={lucroItem >= 0 ? { color: '#00ff88' } : { color: '#ff3860' }}>Lucro: {fmt(lucroItem)}</p>
                  </div>
                </div>
              );
            })}
            <div className="px-6 py-3 flex justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Recebido</span>
              <span className="text-sm font-bold" style={{ color: '#00ff88' }}>{fmt(receitaPaga)}</span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="neo-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-semibold gradient-title">Empenhos Pendentes</h2>
          </div>
          <div>
            {pendentes.map(e => {
              const alerta = e.valorCusto > e.valorVenda;
              const lucroItem = e.qtd * (e.valorVenda - e.valorCusto);
              return (
                <div key={e.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: alerta ? 'rgba(255,56,96,0.05)' : 'transparent' }}>
                  <div>
                    <p className="text-sm font-medium text-white">{e.numero}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.item}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{fmt(e.qtd * e.valorVenda)}</p>
                    <p className="text-xs" style={alerta ? { color: '#ff3860' } : { color: '#94a3b8' }}>
                      {alerta ? '⚠ Prejuízo: ' : 'Lucro: '}{fmt(lucroItem)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="px-6 py-3 flex justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Pendente</span>
              <span className="text-sm font-bold text-amber-400">{fmt(receitaPendente)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
