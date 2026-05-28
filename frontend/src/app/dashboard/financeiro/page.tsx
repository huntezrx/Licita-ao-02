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
        <h1 className="text-3xl font-bold gradient-title glow-title">Financeiro</h1>
        <p className="text-slate-400 mt-1">Resumo financeiro dos empenhos</p>
      </div>

      {alertas.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Atenção: {alertas.length} empenho(s) com custo maior que venda</p>
            <p className="text-xs text-slate-400 mt-0.5">{alertas.map(e => e.numero).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: fmt(receitaTotal), icon: DollarSign, color: 'from-blue-500 to-blue-600', sub: 'Todos os empenhos' },
          { label: 'Custo Total', value: fmt(custoTotal), icon: TrendingDown, color: 'from-slate-500 to-slate-600', sub: 'Total investido' },
          { label: 'Lucro Bruto', value: fmt(lucroTotal), icon: TrendingUp, color: lucroTotal >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600', sub: `Margem: ${margem.toFixed(1)}%` },
          { label: 'A Receber', value: fmt(receitaPendente), icon: AlertCircle, color: 'from-amber-500 to-orange-500', sub: `${pendentes.length} empenhos` },
        ].map(card => (
          <div key={card.label} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400">{card.label}</p>
                <p className="text-xl font-bold text-white mt-1">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color}`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold gradient-title">Empenhos Pagos</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pagos.map(e => (
              <div key={e.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02]">
                <div>
                  <p className="text-sm font-medium text-white">{e.numero}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.item}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{fmt(e.qtd * e.valorVenda)}</p>
                  <p className="text-xs text-slate-500">Lucro: {fmt(e.qtd * (e.valorVenda - e.valorCusto))}</p>
                </div>
              </div>
            ))}
            <div className="px-6 py-3 bg-white/[0.02] flex justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Recebido</span>
              <span className="text-sm font-bold text-emerald-400">{fmt(receitaPaga)}</span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-semibold gradient-title">Empenhos Pendentes</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pendentes.map(e => {
              const alerta = e.valorCusto > e.valorVenda;
              return (
                <div key={e.id} className={`px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] ${alerta ? 'bg-red-500/[0.05]' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-white">{e.numero}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.item}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{fmt(e.qtd * e.valorVenda)}</p>
                    <p className={`text-xs ${alerta ? 'text-red-400' : 'text-slate-500'}`}>
                      {alerta ? '⚠ Prejuízo: ' : 'Lucro: '}{fmt(e.qtd * (e.valorVenda - e.valorCusto))}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="px-6 py-3 bg-white/[0.02] flex justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Pendente</span>
              <span className="text-sm font-bold text-amber-400">{fmt(receitaPendente)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
