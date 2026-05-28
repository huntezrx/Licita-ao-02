'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle, Download } from 'lucide-react';
import { useDemoStore, Empenho, EmpenhoStatus } from '@/store/demoStore';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}
function fmtFull(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const emptyForm: Omit<Empenho, 'id' | 'createdAt'> = {
  numero: '', item: '', und: 'UN', marca: '', qtd: 0, valorVenda: 0,
  qtdEntregue: 0, valorCusto: 0, status: 'PENDENTE', nf: '',
  valorNf: 0, dataEntregaNf: '', responsavelCompra: '', responsavelEntrega: '', observacao: '',
};

export default function EmpenhosPage() {
  const { empenhos, addEmpenho, updateEmpenho, deleteEmpenho, loadFromDB } = useDemoStore();
  const [filter, setFilter] = useState<EmpenhoStatus | 'TODOS'>('TODOS');

  useEffect(() => { loadFromDB(); }, [loadFromDB]);
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
  const aReceber = empenhos.filter(e => e.status === 'PENDENTE').reduce((s, e) => s + e.qtd * e.valorVenda, 0);

  function exportCSV() {
    const headers = ['Nº Empenho','Item','Und','Marca','Qtd','Vlr Venda','Total Venda','Qtd Entregue','Vlr Custo','Total Custo','Lucro','Status','NF','Vlr NF','Data Entrega NF','Resp. Compra','Resp. Entrega','Observação','Criado em'];
    const rows = filtered.map(e => [e.numero,e.item,e.und,e.marca,e.qtd,e.valorVenda,e.qtd*e.valorVenda,e.qtdEntregue,e.valorCusto,e.qtd*e.valorCusto,e.qtd*e.valorVenda-e.qtd*e.valorCusto,e.status,e.nf,e.valorNf,e.dataEntregaNf,e.responsavelCompra,e.responsavelEntrega,e.observacao,e.createdAt]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `empenhos-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function openAdd() { setForm(emptyForm); setModal({ open: true, editing: null }); }
  function openEdit(e: Empenho) {
    setForm({ numero: e.numero, item: e.item, und: e.und, marca: e.marca, qtd: e.qtd, valorVenda: e.valorVenda, qtdEntregue: e.qtdEntregue, valorCusto: e.valorCusto, status: e.status, nf: e.nf, valorNf: e.valorNf, dataEntregaNf: e.dataEntregaNf, responsavelCompra: e.responsavelCompra, responsavelEntrega: e.responsavelEntrega, observacao: e.observacao });
    setModal({ open: true, editing: e });
  }
  function handleDelete(id: string, numero: string) {
    if (window.confirm(`Excluir empenho ${numero}?`)) deleteEmpenho(id);
  }
  function handleSave() {
    if (modal.editing) updateEmpenho(modal.editing.id, form);
    else addEmpenho(form);
    setModal({ open: false, editing: null });
  }

  const statusBadgeClass = (s: EmpenhoStatus) => s === 'PAGO' ? 'badge-success' : s === 'PENDENTE' ? 'badge-warning' : 'badge-danger';
  const statusLabel = (s: EmpenhoStatus) => ({ PAGO: 'Pago', PENDENTE: 'Pendente', CANCELADO: 'Cancelado' }[s]);

  const inputCls = 'input-premium';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#f0f0f2', letterSpacing: '-0.02em' }}>Empenhos</h1>
          <p className="text-sm mt-0.5" style={{ color: '#44444f' }}>Gestão de notas de empenho</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Novo Empenho
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Receita', value: fmt(totalVenda), color: '#f0f0f2' },
          { label: 'Custo', value: fmt(totalCusto), color: '#7f7f8c' },
          { label: 'Lucro', value: fmt(totalLucro), color: totalLucro >= 0 ? '#4ade80' : '#f87171' },
          { label: 'A Receber', value: fmt(aReceber), color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="surface rounded-xl px-4 py-3.5">
            <p className="text-[11px]" style={{ color: '#44444f' }}>{s.label}</p>
            <p className="text-base font-semibold tabular-nums mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(['TODOS', 'PENDENTE', 'PAGO', 'CANCELADO'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: filter === f ? '#1c1c28' : 'transparent',
              color: filter === f ? '#d4d4f0' : '#44444f',
              border: filter === f ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
            }}>
            {f === 'TODOS' ? 'Todos' : f === 'PAGO' ? 'Pagos' : f === 'PENDENTE' ? 'Pendentes' : 'Cancelados'}
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#7f7f8c' }}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Nº Empenho</th><th>Item</th><th>Und</th><th>Qtd</th>
                <th>Vlr Venda</th><th>Total Venda</th><th>Vlr Custo</th><th>Total Custo</th>
                <th>Lucro</th><th>NF</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const tv = e.qtd * e.valorVenda;
                const tc = e.qtd * e.valorCusto;
                const lucro = tv - tc;
                const alerta = e.valorCusto > e.valorVenda;
                return (
                  <tr key={e.id} className="group" style={{ background: alerta ? 'rgba(248,113,113,0.03)' : undefined }}>
                    <td>
                      <span className="font-mono text-[12px]" style={{ color: '#60a5fa' }}>
                        {alerta && <AlertTriangle className="w-3 h-3 inline mr-1" style={{ color: '#f87171' }} />}
                        {e.numero}
                      </span>
                    </td>
                    <td className="max-w-[160px] truncate" title={e.item} style={{ color: '#d4d4d8' }}>{e.item}</td>
                    <td style={{ color: '#7f7f8c' }}>{e.und}</td>
                    <td className="tabular-nums">{e.qtd}</td>
                    <td className="tabular-nums" style={{ color: '#7f7f8c' }}>{fmtFull(e.valorVenda)}</td>
                    <td className="tabular-nums font-medium" style={{ color: '#f0f0f2' }}>{fmt(tv)}</td>
                    <td className="tabular-nums" style={{ color: alerta ? '#f87171' : '#7f7f8c' }}>{fmtFull(e.valorCusto)}</td>
                    <td className="tabular-nums" style={{ color: '#7f7f8c' }}>{fmt(tc)}</td>
                    <td className="tabular-nums font-semibold" style={{ color: lucro >= 0 ? '#4ade80' : '#f87171' }}>{fmt(lucro)}</td>
                    <td style={{ color: '#7f7f8c' }}>{e.nf || '—'}</td>
                    <td><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadgeClass(e.status)}`}>{statusLabel(e.status)}</span></td>
                    <td>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-md transition-colors" style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)' }}>
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(e.id, e.numero)} className="p-1.5 rounded-md transition-colors" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td colSpan={5} className="px-4 py-3 text-[11px]" style={{ color: '#44444f' }}>
                  {filtered.length} empenho{filtered.length !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums" style={{ color: '#f0f0f2' }}>{fmt(totalVenda)}</td>
                <td />
                <td className="px-4 py-3 text-sm font-semibold tabular-nums" style={{ color: '#7f7f8c' }}>{fmt(totalCusto)}</td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums" style={{ color: totalLucro >= 0 ? '#4ade80' : '#f87171' }}>{fmt(totalLucro)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>{modal.editing ? 'Editar Empenho' : 'Novo Empenho'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 rounded-lg transition-colors" style={{ color: '#44444f' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                { label: 'Nº Empenho', key: 'numero', type: 'text' },
                { label: 'Item / Objeto', key: 'item', type: 'text', full: true },
                { label: 'Unidade', key: 'und', type: 'text' },
                { label: 'Marca', key: 'marca', type: 'text' },
                { label: 'Quantidade', key: 'qtd', type: 'number' },
                { label: 'Valor de Venda (unit.)', key: 'valorVenda', type: 'number' },
                { label: 'Qtd Entregue', key: 'qtdEntregue', type: 'number' },
                { label: 'Valor de Custo (unit.)', key: 'valorCusto', type: 'number' },
                { label: 'Nº NF', key: 'nf', type: 'text' },
                { label: 'Valor NF', key: 'valorNf', type: 'number' },
                { label: 'Data Entrega NF', key: 'dataEntregaNf', type: 'date' },
                { label: 'Resp. Compra', key: 'responsavelCompra', type: 'text' },
                { label: 'Resp. Entrega', key: 'responsavelEntrega', type: 'text' },
              ] as { label: string; key: keyof Omit<Empenho, 'id' | 'createdAt'>; type: string; full?: boolean }[]).map(({ label, key, type, full }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>{label}</label>
                  <input type={type} value={form[key] as string | number}
                    onChange={ev => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(ev.target.value) || 0 : ev.target.value }))}
                    className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>Status</label>
                <select value={form.status} onChange={ev => setForm(f => ({ ...f, status: ev.target.value as EmpenhoStatus }))} className={`${inputCls} select`} style={{ background: '#161619' }}>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>Observação</label>
                <textarea value={form.observacao} onChange={ev => setForm(f => ({ ...f, observacao: ev.target.value }))} rows={2} className={inputCls} style={{ resize: 'none' }} />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setModal({ open: false, editing: null })} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} className="btn-primary flex-1">{modal.editing ? 'Salvar Alterações' : 'Criar Empenho'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
