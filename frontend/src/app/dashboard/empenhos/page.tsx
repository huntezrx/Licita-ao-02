'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Download, X, AlertTriangle } from 'lucide-react';
import { useDemoStore, Empenho, EmpenhoStatus } from '@/store/demoStore';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const emptyForm: Omit<Empenho, 'id' | 'createdAt'> = {
  numero: '', item: '', und: 'UN', marca: '', qtd: 0, valorVenda: 0,
  qtdEntregue: 0, valorCusto: 0, status: 'PENDENTE', nf: '',
  valorNf: 0, dataEntregaNf: '', responsavelCompra: '', responsavelEntrega: '', observacao: '',
};

export default function EmpenhosPage() {
  const { empenhos, addEmpenho, updateEmpenho, deleteEmpenho } = useDemoStore();
  const [filter, setFilter] = useState<EmpenhoStatus | 'TODOS'>('TODOS');
  const [modal, setModal] = useState<{ open: boolean; editing: Empenho | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Empenho, 'id' | 'createdAt'>>(emptyForm);

  const filtered = filter === 'TODOS' ? empenhos : empenhos.filter(e => e.status === filter);
  const counts = {
    TODOS: empenhos.length,
    PENDENTE: empenhos.filter(e => e.status === 'PENDENTE').length,
    PAGO: empenhos.filter(e => e.status === 'PAGO').length,
    CANCELADO: empenhos.filter(e => e.status === 'CANCELADO').length,
  };

  const totalVenda = filtered.reduce((s, e) => s + e.qtd * e.valorVenda, 0);
  const totalCusto = filtered.reduce((s, e) => s + e.qtd * e.valorCusto, 0);
  const totalLucro = totalVenda - totalCusto;
  const totalPendente = empenhos.filter(e => e.status === 'PENDENTE').reduce((s, e) => s + e.qtd * e.valorVenda, 0);

  function openAdd() { setForm(emptyForm); setModal({ open: true, editing: null }); }
  function openEdit(e: Empenho) { setForm({ numero: e.numero, item: e.item, und: e.und, marca: e.marca, qtd: e.qtd, valorVenda: e.valorVenda, qtdEntregue: e.qtdEntregue, valorCusto: e.valorCusto, status: e.status, nf: e.nf, valorNf: e.valorNf, dataEntregaNf: e.dataEntregaNf, responsavelCompra: e.responsavelCompra, responsavelEntrega: e.responsavelEntrega, observacao: e.observacao }); setModal({ open: true, editing: e }); }
  function handleDelete(id: string, numero: string) {
    if (window.confirm(`Confirmar exclusão do empenho ${numero}?`)) deleteEmpenho(id);
  }
  function handleSave() {
    if (modal.editing) updateEmpenho(modal.editing.id, form);
    else addEmpenho(form);
    setModal({ open: false, editing: null });
  }

  const statusBadge = (s: EmpenhoStatus) => {
    if (s === 'PAGO') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (s === 'PENDENTE') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-title glow-title">Empenhos</h1>
          <p className="text-slate-400 mt-1">Gestão de notas de empenho e controle financeiro</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => alert('Funcionalidade de exportação disponível na versão com backend')} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-slate-300 hover:text-white transition-all text-sm">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-500/25">
            <Plus className="w-4 h-4" /> Novo Empenho
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Receita Total', value: fmt(totalVenda), color: 'text-blue-400' },
          { label: 'Custo Total', value: fmt(totalCusto), color: 'text-slate-300' },
          { label: 'Lucro', value: fmt(totalLucro), color: totalLucro >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'A Receber', value: fmt(totalPendente), color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['TODOS', 'PENDENTE', 'PAGO', 'CANCELADO'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20' : 'glass-card text-slate-400 hover:text-white'}`}>
            {f} <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === f ? 'bg-white/20' : 'bg-white/10'}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Nº Empenho', 'Item', 'Und', 'Marca', 'Qtd', 'Vlr Venda', 'Total Venda', 'Qtd Entregue', 'Vlr Custo', 'Total Custo', 'Lucro', 'NF', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((e) => {
                const tv = e.qtd * e.valorVenda;
                const tc = e.qtd * e.valorCusto;
                const lucro = tv - tc;
                const alerta = e.valorCusto > e.valorVenda;
                return (
                  <tr key={e.id} className={`transition-all group ${alerta ? 'bg-red-500/[0.07] hover:bg-red-500/[0.12]' : 'hover:bg-white/[0.03]'}`}>
                    <td className="px-4 py-3 font-mono text-blue-300 whitespace-nowrap">{alerta && <AlertTriangle className="w-3 h-3 text-red-400 inline mr-1" />}{e.numero}</td>
                    <td className="px-4 py-3 text-slate-200 max-w-[180px] truncate" title={e.item}>{e.item}</td>
                    <td className="px-4 py-3 text-slate-400">{e.und}</td>
                    <td className="px-4 py-3 text-slate-400">{e.marca}</td>
                    <td className="px-4 py-3 text-white">{e.qtd}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmt(e.valorVenda)}</td>
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{fmt(tv)}</td>
                    <td className="px-4 py-3 text-slate-300">{e.qtdEntregue}</td>
                    <td className={`px-4 py-3 whitespace-nowrap font-medium ${alerta ? 'text-red-400' : 'text-slate-300'}`}>{fmt(e.valorCusto)}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmt(tc)}</td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(lucro)}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{e.nf || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(e.status)}`}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(e.id, e.numero)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/[0.1] bg-white/[0.02]">
                <td className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase" colSpan={6}>Totais ({filtered.length} empenhos)</td>
                <td className="px-4 py-3 text-white font-bold">{fmt(totalVenda)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-white font-bold">{fmt(totalCusto)}</td>
                <td className={`px-4 py-3 font-bold ${totalLucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(totalLucro)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-xl font-bold gradient-title">{modal.editing ? 'Editar Empenho' : 'Novo Empenho'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                { label: 'Nº Empenho', key: 'numero', type: 'text' },
                { label: 'Item/Objeto', key: 'item', type: 'text', full: true },
                { label: 'Unidade', key: 'und', type: 'text' },
                { label: 'Marca', key: 'marca', type: 'text' },
                { label: 'Quantidade', key: 'qtd', type: 'number' },
                { label: 'Valor Venda (unit)', key: 'valorVenda', type: 'number' },
                { label: 'Qtd Entregue', key: 'qtdEntregue', type: 'number' },
                { label: 'Valor Custo (unit)', key: 'valorCusto', type: 'number' },
                { label: 'Nº NF', key: 'nf', type: 'text' },
                { label: 'Valor NF', key: 'valorNf', type: 'number' },
                { label: 'Data Entrega NF', key: 'dataEntregaNf', type: 'date' },
                { label: 'Resp. Compra', key: 'responsavelCompra', type: 'text' },
                { label: 'Resp. Entrega', key: 'responsavelEntrega', type: 'text' },
              ] as { label: string; key: keyof Omit<Empenho, 'id' | 'createdAt'>; type: string; full?: boolean }[]).map(({ label, key, type, full }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key] as string | number}
                    onChange={ev => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(ev.target.value) || 0 : ev.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all placeholder-slate-600"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select value={form.status} onChange={ev => setForm(f => ({ ...f, status: ev.target.value as EmpenhoStatus }))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all">
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="PAGO">PAGO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Observação</label>
                <textarea value={form.observacao} onChange={ev => setForm(f => ({ ...f, observacao: ev.target.value }))} rows={2}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none placeholder-slate-600" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-white/[0.08]">
              <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white transition-all text-sm font-medium">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-500/25">
                {modal.editing ? 'Salvar Alterações' : 'Criar Empenho'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
