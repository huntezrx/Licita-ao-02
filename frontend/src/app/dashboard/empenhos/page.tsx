'use client';

import { useState } from 'react';
import { Plus, Download, AlertTriangle } from 'lucide-react';

interface Empenho {
  id: string;
  item: string;
  und: string;
  marca: string;
  qtd: number;
  valorVenda: number;
  qtdEntregue: number;
  valorCusto: number;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO';
  nf: string;
  valorNf: number;
  dataEntregaNf: string;
  respCompra: string;
  respEntrega: string;
}

const mockData: Empenho[] = [
  { id: '2024NE001', item: 'Material de Escritório', und: 'UN', marca: 'Staples', qtd: 100, valorVenda: 25.00, qtdEntregue: 100, valorCusto: 18.00, status: 'PAGO', nf: '001234', valorNf: 2500, dataEntregaNf: '10/01/2024', respCompra: 'João Silva', respEntrega: 'Maria Santos' },
  { id: '2024NE002', item: 'Equipamento de TI - Notebook', und: 'UN', marca: 'Dell', qtd: 5, valorVenda: 4500.00, qtdEntregue: 3, valorCusto: 3800.00, status: 'PENDENTE', nf: '', valorNf: 0, dataEntregaNf: '', respCompra: 'Pedro Costa', respEntrega: 'Ana Lima' },
  { id: '2024NE003', item: 'Cadeiras Ergonômicas', und: 'UN', marca: 'Herman Miller', qtd: 20, valorVenda: 850.00, qtdEntregue: 20, valorCusto: 920.00, status: 'PENDENTE', nf: '001235', valorNf: 17000, dataEntregaNf: '15/02/2024', respCompra: 'Carlos Souza', respEntrega: 'Carlos Souza' },
  { id: '2024NE004', item: 'Papel A4 Resma 500fls', und: 'PCT', marca: 'Chamex', qtd: 200, valorVenda: 28.00, qtdEntregue: 200, valorCusto: 21.00, status: 'PAGO', nf: '001236', valorNf: 5600, dataEntregaNf: '20/02/2024', respCompra: 'João Silva', respEntrega: 'Maria Santos' },
  { id: '2024NE005', item: 'Canetas BIC Azul', und: 'CX', marca: 'BIC', qtd: 50, valorVenda: 35.00, qtdEntregue: 0, valorCusto: 28.00, status: 'CANCELADO', nf: '', valorNf: 0, dataEntregaNf: '', respCompra: 'Ana Lima', respEntrega: '' },
  { id: '2024NE006', item: 'Servidor HP ProLiant', und: 'UN', marca: 'HP', qtd: 2, valorVenda: 18000.00, qtdEntregue: 2, valorCusto: 15500.00, status: 'PAGO', nf: '001237', valorNf: 36000, dataEntregaNf: '05/03/2024', respCompra: 'Pedro Costa', respEntrega: 'Pedro Costa' },
  { id: '2024NE007', item: 'Uniformes Operacionais', und: 'KIT', marca: 'Confecções BR', qtd: 30, valorVenda: 180.00, qtdEntregue: 15, valorCusto: 195.00, status: 'PENDENTE', nf: '001238', valorNf: 2700, dataEntregaNf: '12/03/2024', respCompra: 'Carlos Souza', respEntrega: 'Ana Lima' },
  { id: '2024NE008', item: 'Ar Condicionado Split 12000 BTU', und: 'UN', marca: 'Gree', qtd: 8, valorVenda: 2200.00, qtdEntregue: 8, valorCusto: 1750.00, status: 'PAGO', nf: '001239', valorNf: 17600, dataEntregaNf: '18/03/2024', respCompra: 'João Silva', respEntrega: 'Carlos Souza' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PAGO') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">PAGO</span>;
  if (status === 'PENDENTE') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">PENDENTE</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">CANCELADO</span>;
}

export default function EmpenhosPage() {
  const [filtro, setFiltro] = useState<'TODOS' | 'PENDENTE' | 'PAGO' | 'CANCELADO'>('TODOS');

  const filtered = filtro === 'TODOS' ? mockData : mockData.filter((e) => e.status === filtro);

  const totalVenda = filtered.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const totalCusto = filtered.reduce((s, e) => s + e.qtd * e.valorCusto, 0);
  const totalLucro = totalVenda - totalCusto;
  const totalPendente = mockData.filter((e) => e.status === 'PENDENTE').reduce((s, e) => s + e.qtd * e.valorVenda, 0);

  const counts = {
    TODOS: mockData.length,
    PENDENTE: mockData.filter((e) => e.status === 'PENDENTE').length,
    PAGO: mockData.filter((e) => e.status === 'PAGO').length,
    CANCELADO: mockData.filter((e) => e.status === 'CANCELADO').length,
  };

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Empenhos</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestão de empenhos e notas fiscais</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Novo Empenho
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Receita Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(totalVenda)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Custo Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(totalCusto)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Lucro Total</p>
          <p className={`text-lg font-bold ${totalLucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(totalLucro)}</p>
        </div>
        <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-amber-400 mb-1">A Receber (Pendente)</p>
          <p className="text-lg font-bold text-amber-400">{formatCurrency(totalPendente)}</p>
        </div>
      </div>

      {/* Alert for cost > price */}
      {mockData.some((e) => e.valorCusto > e.valorVenda) && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/40 border border-red-500/30 rounded-xl text-sm text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Atenção: {mockData.filter((e) => e.valorCusto > e.valorVenda).length} empenho(s) com custo superior ao valor de venda — destacados em vermelho.
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['TODOS', 'PENDENTE', 'PAGO', 'CANCELADO'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {f}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filtro === f ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nº Empenho</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Objeto/Item</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Und</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Marca</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Qtd</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vlr Venda</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Venda</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Qtd Entregue</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vlr Custo</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Custo</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lucro</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">NF</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Resp. Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((emp) => {
                const totalVendaEmp = emp.qtd * emp.valorVenda;
                const totalCustoEmp = emp.qtd * emp.valorCusto;
                const lucro = totalVendaEmp - totalCustoEmp;
                const prejuizo = emp.valorCusto > emp.valorVenda;
                return (
                  <tr
                    key={emp.id}
                    className={`transition-colors ${
                      prejuizo
                        ? 'bg-red-950/30 hover:bg-red-950/40'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-blue-400 font-semibold">{emp.id}</td>
                    <td className="py-3 px-4 text-slate-200 max-w-[220px]">
                      <span className="truncate block">{emp.item}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{emp.und}</td>
                    <td className="py-3 px-4 text-slate-400">{emp.marca}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{emp.qtd}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatCurrency(emp.valorVenda)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-white">{formatCurrency(totalVendaEmp)}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{emp.qtdEntregue}</td>
                    <td className={`py-3 px-4 text-right ${prejuizo ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>{formatCurrency(emp.valorCusto)}</td>
                    <td className={`py-3 px-4 text-right ${prejuizo ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>{formatCurrency(totalCustoEmp)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(lucro)}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status={emp.status} /></td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{emp.nf || '—'}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{emp.respCompra}</td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Row */}
            <tfoot>
              <tr className="border-t-2 border-slate-700 bg-slate-800/50">
                <td colSpan={6} className="py-3 px-4 text-xs font-bold text-slate-300 uppercase">Total ({filtered.length} registros)</td>
                <td className="py-3 px-4 text-right font-bold text-white">{formatCurrency(totalVenda)}</td>
                <td className="py-3 px-4" />
                <td className="py-3 px-4" />
                <td className="py-3 px-4 text-right font-bold text-white">{formatCurrency(totalCusto)}</td>
                <td className={`py-3 px-4 text-right font-bold ${totalLucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(totalLucro)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
