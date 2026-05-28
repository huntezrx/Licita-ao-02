'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { useDemoStore, Empenho, EmpenhoItem, EmpenhoStatus } from '@/store/demoStore';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
function fmtFull(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function totals(e: Empenho) {
  const tv = e.itens.reduce((s, i) => s + i.qtd * i.valorVenda, 0);
  const tc = e.itens.reduce((s, i) => s + i.qtd * i.valorCusto, 0);
  return { tv, tc, lucro: tv - tc };
}

const emptyItem = (): EmpenhoItem => ({
  id: Date.now().toString() + Math.random(),
  descricao: '', und: 'UN', marca: '',
  qtd: 0, valorVenda: 0, qtdEntregue: 0, valorCusto: 0,
  nf: '', valorNf: 0, dataEntregaNf: '',
});

const emptyForm: Omit<Empenho, 'id' | 'createdAt'> = {
  numero: '', fornecedor: '', orgao: '', itens: [],
  status: 'PENDENTE',
  responsavelCompra: '', responsavelEntrega: '', observacao: '',
};

export default function EmpenhosPage() {
  const { empenhos, addEmpenho, updateEmpenho, deleteEmpenho, loadFromDB } = useDemoStore();
  const [filter, setFilter] = useState<EmpenhoStatus | 'TODOS'>('TODOS');
  const [modal, setModal] = useState<{ open: boolean; editing: Empenho | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Empenho, 'id' | 'createdAt'>>(emptyForm);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  const filtered = filter === 'TODOS' ? empenhos : empenhos.filter(e => e.status === filter);
  const counts = {
    TODOS: empenhos.length,
    PENDENTE: empenhos.filter(e => e.status === 'PENDENTE').length,
    PAGO: empenhos.filter(e => e.status === 'PAGO').length,
    CANCELADO: empenhos.filter(e => e.status === 'CANCELADO').length,
  };

  const allTv = filtered.reduce((s, e) => s + totals(e).tv, 0);
  const allTc = filtered.reduce((s, e) => s + totals(e).tc, 0);
  const totalLucro = allTv - allTc;
  const aReceber = empenhos.filter(e => e.status === 'PENDENTE').reduce((s, e) => s + totals(e).tv, 0);

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function openAdd() {
    setForm({ ...emptyForm, itens: [emptyItem()] });
    setModal({ open: true, editing: null });
  }
  function openEdit(e: Empenho) {
    setForm({
      numero: e.numero, fornecedor: e.fornecedor, orgao: e.orgao,
      itens: e.itens.map(i => ({ ...i })),
      status: e.status,
      responsavelCompra: e.responsavelCompra, responsavelEntrega: e.responsavelEntrega, observacao: e.observacao,
    });
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
  function addItem() { setForm(f => ({ ...f, itens: [...f.itens, emptyItem()] })); }
  function updateItem(idx: number, field: keyof EmpenhoItem, value: string | number) {
    setForm(f => ({ ...f, itens: f.itens.map((it, i) => i === idx ? { ...it, [field]: value } : it) }));
  }
  function removeItem(idx: number) { setForm(f => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) })); }

  function exportCSV() {
    const headers = ['Nº Empenho', 'Fornecedor', 'Órgão', 'Status', 'Resp. Compra', 'Resp. Entrega', 'Item #', 'Descrição', 'Und', 'Marca', 'Qtd', 'Vlr Venda', 'Total Venda', 'Qtd Entregue', 'Vlr Custo', 'Total Custo', 'Lucro', 'NF', 'Valor NF', 'Data Entrega NF', 'Criado em'];
    const rows: (string | number)[][] = [];
    filtered.forEach(e => {
      e.itens.forEach((it, idx) => {
        rows.push([e.numero, e.fornecedor, e.orgao, e.status, e.responsavelCompra, e.responsavelEntrega, idx + 1, it.descricao, it.und, it.marca, it.qtd, it.valorVenda, it.qtd * it.valorVenda, it.qtdEntregue, it.valorCusto, it.qtd * it.valorCusto, it.qtd * it.valorVenda - it.qtd * it.valorCusto, it.nf, it.valorNf, it.dataEntregaNf, e.createdAt]);
      });
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `empenhos-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const sbadge = (s: EmpenhoStatus) => s === 'PAGO' ? 'badge-success' : s === 'PENDENTE' ? 'badge-warning' : 'badge-danger';
  const slabel = { PAGO: 'Pago', PENDENTE: 'Pendente', CANCELADO: 'Cancelado' };

  const modalItemTv = form.itens.reduce((s, i) => s + i.qtd * i.valorVenda, 0);
  const modalItemTc = form.itens.reduce((s, i) => s + i.qtd * i.valorCusto, 0);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#111827', letterSpacing: '-0.02em' }}>Empenhos</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>Gestão de notas de empenho</p>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Receita', value: fmt(allTv), color: '#111827' },
          { label: 'Custo', value: fmt(allTc), color: '#6b7280' },
          { label: 'Lucro', value: fmt(totalLucro), color: totalLucro >= 0 ? '#16a34a' : '#dc2626' },
          { label: 'A Receber', value: fmt(aReceber), color: '#d97706' },
        ].map(s => (
          <div key={s.label} className="surface rounded-xl px-4 py-3.5">
            <p className="text-[11px]" style={{ color: '#9ca3af' }}>{s.label}</p>
            <p className="text-base font-semibold tabular-nums mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {(['TODOS', 'PENDENTE', 'PAGO', 'CANCELADO'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
            style={{ background: filter === f ? '#eff6ff' : 'transparent', color: filter === f ? '#1d4ed8' : '#9ca3af', border: filter === f ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent' }}>
            {f === 'TODOS' ? 'Todos' : f === 'PAGO' ? 'Pagos' : f === 'PENDENTE' ? 'Pendentes' : 'Cancelados'}
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.06)', color: '#6b7280' }}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Nº Empenho</th>
                <th>Fornecedor</th>
                <th>Órgão</th>
                <th>Itens</th>
                <th>Total Venda</th>
                <th>Lucro</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const { tv, lucro } = totals(e);
                const hasAlert = e.itens.some(i => i.valorCusto > i.valorVenda);
                const isExpanded = expanded.has(e.id);
                return [
                  <tr key={e.id} className="group" style={{ background: hasAlert ? 'rgba(220,38,38,0.02)' : undefined }}>
                    <td>
                      <button onClick={() => toggleExpand(e.id)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" style={{ color: '#6b7280' }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />}
                      </button>
                    </td>
                    <td>
                      <span className="font-mono text-[12px]" style={{ color: '#2563eb' }}>
                        {hasAlert && <AlertTriangle className="w-3 h-3 inline mr-1 mb-0.5" style={{ color: '#dc2626' }} />}
                        {e.numero}
                      </span>
                    </td>
                    <td className="max-w-[180px] truncate" title={e.fornecedor}>{e.fornecedor}</td>
                    <td className="max-w-[140px] truncate" title={e.orgao} style={{ color: '#6b7280' }}>{e.orgao}</td>
                    <td>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}>
                        {e.itens.length} {e.itens.length === 1 ? 'item' : 'itens'}
                      </span>
                    </td>
                    <td className="tabular-nums font-medium" style={{ color: '#111827' }}>{fmt(tv)}</td>
                    <td className="tabular-nums font-semibold" style={{ color: lucro >= 0 ? '#16a34a' : '#dc2626' }}>{fmt(lucro)}</td>
                    <td><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${sbadge(e.status)}`}>{slabel[e.status]}</span></td>
                    <td>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-md" style={{ color: '#2563eb', background: 'rgba(59,130,246,0.08)' }}><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(e.id, e.numero)} className="p-1.5 rounded-md" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>,
                  isExpanded && (
                    <tr key={`${e.id}-exp`}>
                      <td colSpan={9} style={{ padding: 0 }}>
                        <div className="px-10 py-3" style={{ background: '#f9fafb', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                          <div className="overflow-x-auto">
                            <table className="w-full" style={{ fontSize: 12 }}>
                              <thead>
                                <tr>
                                  {['#', 'Descrição', 'Und', 'Marca', 'Qtd', 'Vlr Venda', 'Total', 'Qtd Entregue', 'Vlr Custo', 'Lucro', 'NF', 'Valor NF', 'Data Entrega'].map(h => (
                                    <th key={h} className="text-left pb-2 pr-3" style={{ color: '#9ca3af', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {e.itens.map((it, idx) => {
                                  const itv = it.qtd * it.valorVenda;
                                  const itc = it.qtd * it.valorCusto;
                                  const alert = it.valorCusto > it.valorVenda;
                                  return (
                                    <tr key={it.id} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                      <td className="py-2 pr-3" style={{ color: '#9ca3af' }}>{idx + 1}</td>
                                      <td className="py-2 pr-3" style={{ color: '#374151', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={it.descricao}>{it.descricao}</td>
                                      <td className="py-2 pr-3" style={{ color: '#6b7280' }}>{it.und}</td>
                                      <td className="py-2 pr-3" style={{ color: '#6b7280' }}>{it.marca || '—'}</td>
                                      <td className="py-2 pr-3 tabular-nums">{it.qtd}</td>
                                      <td className="py-2 pr-3 tabular-nums" style={{ color: alert ? '#dc2626' : '#6b7280' }}>{fmtFull(it.valorVenda)}</td>
                                      <td className="py-2 pr-3 tabular-nums font-medium" style={{ color: '#111827' }}>{fmt(itv)}</td>
                                      <td className="py-2 pr-3 tabular-nums" style={{ color: '#6b7280' }}>{it.qtdEntregue}</td>
                                      <td className="py-2 pr-3 tabular-nums" style={{ color: alert ? '#dc2626' : '#9ca3af' }}>{fmtFull(it.valorCusto)}</td>
                                      <td className="py-2 pr-3 tabular-nums font-semibold" style={{ color: (itv - itc) >= 0 ? '#16a34a' : '#dc2626' }}>{fmt(itv - itc)}</td>
                                      <td className="py-2 pr-3 font-mono" style={{ color: '#2563eb', whiteSpace: 'nowrap' }}>{it.nf || '—'}</td>
                                      <td className="py-2 pr-3 tabular-nums" style={{ color: '#374151' }}>{it.valorNf ? fmt(it.valorNf) : '—'}</td>
                                      <td className="py-2" style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>{it.dataEntregaNf || '—'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                ].filter(Boolean);
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                <td colSpan={5} className="px-4 py-3 text-[11px]" style={{ color: '#9ca3af' }}>{filtered.length} empenho{filtered.length !== 1 ? 's' : ''}</td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums" style={{ color: '#111827' }}>{fmt(allTv)}</td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums" style={{ color: totalLucro >= 0 ? '#16a34a' : '#dc2626' }}>{fmt(totalLucro)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>{modal.editing ? 'Editar Empenho' : 'Novo Empenho'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" style={{ color: '#6b7280' }} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Identificação */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#9ca3af' }}>Identificação</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Nº Empenho</label>
                    <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} className="input-premium" placeholder="2026NE000001" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Fornecedor</label>
                    <input value={form.fornecedor} onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))} className="input-premium" placeholder="Razão social do fornecedor" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Órgão</label>
                    <input value={form.orgao} onChange={e => setForm(f => ({ ...f, orgao: e.target.value }))} className="input-premium" placeholder="Órgão responsável" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EmpenhoStatus }))} className="input-premium select">
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Resp. Compra</label>
                    <input value={form.responsavelCompra} onChange={e => setForm(f => ({ ...f, responsavelCompra: e.target.value }))} className="input-premium" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Resp. Entrega</label>
                    <input value={form.responsavelEntrega} onChange={e => setForm(f => ({ ...f, responsavelEntrega: e.target.value }))} className="input-premium" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Observação</label>
                    <textarea value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} rows={2} className="input-premium" style={{ resize: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Itens */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                    Itens do Empenho <span style={{ color: '#d97706' }}>({form.itens.length})</span>
                  </p>
                  <button onClick={addItem} className="btn-ghost flex items-center gap-1.5 text-[12px] py-1.5 px-3">
                    <Plus className="w-3 h-3" /> Adicionar Item
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full table-premium">
                      <thead>
                        <tr>
                          <th style={{ width: 32 }}>#</th>
                          <th>Descrição</th>
                          <th>Und</th>
                          <th>Marca</th>
                          <th>Qtd</th>
                          <th>Vlr Venda</th>
                          <th>Qtd Entregue</th>
                          <th>Vlr Custo</th>
                          <th>NF</th>
                          <th>Valor NF</th>
                          <th>Data Entrega NF</th>
                          <th style={{ width: 40 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.itens.map((it, idx) => (
                          <tr key={it.id}>
                            <td style={{ color: '#9ca3af', fontSize: 11 }}>{idx + 1}</td>
                            <td style={{ minWidth: 0 }}>
                              <input value={it.descricao} onChange={e => updateItem(idx, 'descricao', e.target.value)} className="input-premium" style={{ minWidth: 180 }} placeholder="Descrição do item" />
                            </td>
                            <td><input value={it.und} onChange={e => updateItem(idx, 'und', e.target.value)} className="input-premium" style={{ width: 56 }} /></td>
                            <td><input value={it.marca} onChange={e => updateItem(idx, 'marca', e.target.value)} className="input-premium" style={{ width: 80 }} /></td>
                            <td><input type="number" value={it.qtd} onChange={e => updateItem(idx, 'qtd', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 68 }} /></td>
                            <td><input type="number" step="0.01" value={it.valorVenda} onChange={e => updateItem(idx, 'valorVenda', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 90 }} /></td>
                            <td><input type="number" value={it.qtdEntregue} onChange={e => updateItem(idx, 'qtdEntregue', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 76 }} /></td>
                            <td><input type="number" step="0.01" value={it.valorCusto} onChange={e => updateItem(idx, 'valorCusto', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 90 }} /></td>
                            <td><input value={it.nf} onChange={e => updateItem(idx, 'nf', e.target.value)} className="input-premium" style={{ width: 100 }} placeholder="NF-000000" /></td>
                            <td><input type="number" step="0.01" value={it.valorNf} onChange={e => updateItem(idx, 'valorNf', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 90 }} /></td>
                            <td><input type="date" value={it.dataEntregaNf} onChange={e => updateItem(idx, 'dataEntregaNf', e.target.value)} className="input-premium" style={{ width: 130 }} /></td>
                            <td>
                              <button onClick={() => removeItem(idx)} disabled={form.itens.length <= 1} className="p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-30">
                                <Trash2 className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {form.itens.length === 0 && (
                          <tr><td colSpan={12} className="py-8 text-center text-[12px]" style={{ color: '#9ca3af' }}>Clique em &quot;Adicionar Item&quot;</td></tr>
                        )}
                      </tbody>
                      {form.itens.length > 0 && (
                        <tfoot>
                          <tr style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: '#f9fafb' }}>
                            <td colSpan={4} className="px-4 py-2.5 text-[11px]" style={{ color: '#9ca3af' }}>Total ({form.itens.length} itens)</td>
                            <td />
                            <td className="px-4 py-2.5 text-[12px] font-semibold tabular-nums" style={{ color: '#111827' }}>{fmt(modalItemTv)}</td>
                            <td />
                            <td className="px-4 py-2.5 text-[12px] font-semibold tabular-nums" style={{ color: '#6b7280' }}>{fmt(modalItemTc)}</td>
                            <td colSpan={3} />
                            <td className="px-4 py-2.5 text-[12px] font-semibold tabular-nums" style={{ color: (modalItemTv - modalItemTc) >= 0 ? '#16a34a' : '#dc2626' }}>
                              {fmt(modalItemTv - modalItemTc)} lucro
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <button onClick={() => setModal({ open: false, editing: null })} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} className="btn-primary flex-1">{modal.editing ? 'Salvar Alterações' : 'Criar Empenho'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
