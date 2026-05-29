'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle, Download, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useDemoStore, Empenho, EmpenhoItem, EmpenhoStatus, NfStatus } from '@/store/demoStore';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
function fmtFull(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function totals(e: Empenho) {
  const tv = e.itens.reduce((s, i) => s + i.qtd * i.valorVenda, 0);
  const tc = e.itens.reduce((s, i) => s + i.qtdEntregue * i.valorCusto, 0);
  return { tv, tc };
}

const emptyItem = (): EmpenhoItem => ({
  id: Date.now().toString() + Math.random(),
  descricao: '', und: 'UN', marca: '',
  qtd: 0, valorVenda: 0, qtdEntregue: 0, valorCusto: 0,
  nf: '', valorNf: 0, dataEntregaNf: '',
  nfStatus: 'AGUARDANDO_PAGAMENTO', nfDataPagamento: '', nfArquivo: '',
});

const emptyForm: Omit<Empenho, 'id' | 'createdAt'> = {
  numero: '', fornecedor: '', orgao: '', itens: [],
  status: 'PENDENTE', responsavelCompra: '', responsavelEntrega: '', observacao: '',
};

const STATUS_LABELS: Record<EmpenhoStatus, string> = {
  PENDENTE: 'Pendente', EM_ENTREGA: 'Em Entrega',
  ENTREGA_PARCIAL: 'Entrega Parcial', ENTREGA_TOTAL: 'Entrega Total', CANCELADO: 'Cancelado',
};
const STATUS_BADGE: Record<EmpenhoStatus, string> = {
  PENDENTE: 'badge-warning', EM_ENTREGA: 'badge-blue',
  ENTREGA_PARCIAL: 'badge-warning', ENTREGA_TOTAL: 'badge-success', CANCELADO: 'badge-danger',
};
const NF_STATUS_LABELS: Record<NfStatus, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
  PAGAMENTO_EFETUADO: 'Pagamento Efetuado',
  NOTA_CANCELADA: 'Nota Cancelada',
};
const NF_STATUS_BADGE: Record<NfStatus, string> = {
  AGUARDANDO_PAGAMENTO: 'badge-warning',
  PAGAMENTO_EFETUADO: 'badge-success',
  NOTA_CANCELADA: 'badge-danger',
};

// ─── NF Group helper ────────────────────────────────────────────
interface NFGroup {
  key: string;
  nfNumero: string;
  empenhoId: string;
  empenhoNumero: string;
  orgao: string;
  itens: EmpenhoItem[];
  totalVenda: number;
  totalCusto: number;
  nfStatus: NfStatus;
  nfDataPagamento: string;
  nfArquivo: string;
}

function buildNFGroups(empenhos: Empenho[]): NFGroup[] {
  const groups: NFGroup[] = [];
  for (const e of empenhos) {
    const seen = new Map<string, NFGroup>();
    for (const it of e.itens) {
      const key = `${e.id}__${it.nf || '__sem_nf__' + it.id}`;
      if (!seen.has(key)) {
        seen.set(key, {
          key, nfNumero: it.nf, empenhoId: e.id, empenhoNumero: e.numero, orgao: e.orgao,
          itens: [], totalVenda: 0, totalCusto: 0,
          nfStatus: it.nfStatus ?? 'AGUARDANDO_PAGAMENTO',
          nfDataPagamento: it.nfDataPagamento ?? '',
          nfArquivo: it.nfArquivo ?? '',
        });
      }
      const g = seen.get(key)!;
      g.itens.push(it);
      g.totalVenda += it.qtd * it.valorVenda;
      g.totalCusto += it.qtdEntregue * it.valorCusto;
    }
    groups.push(...seen.values());
  }
  return groups.filter(g => g.nfNumero); // only groups with a NF number
}

// ─── Main component ─────────────────────────────────────────────
export default function EmpenhosPage() {
  const { empenhos, addEmpenho, updateEmpenho, deleteEmpenho, updateNFStatus, loadFromDB } = useDemoStore();
  const [tab, setTab] = useState<'empenhos' | 'notas'>('empenhos');
  const [filter, setFilter] = useState<EmpenhoStatus | 'TODOS'>('TODOS');
  const [modal, setModal] = useState<{ open: boolean; editing: Empenho | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Empenho, 'id' | 'createdAt'>>(emptyForm);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [nfExpanded, setNfExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  const filtered = filter === 'TODOS' ? empenhos : empenhos.filter(e => e.status === filter);
  const counts: Record<string, number> = {
    TODOS: empenhos.length,
    PENDENTE: empenhos.filter(e => e.status === 'PENDENTE').length,
    EM_ENTREGA: empenhos.filter(e => e.status === 'EM_ENTREGA').length,
    ENTREGA_PARCIAL: empenhos.filter(e => e.status === 'ENTREGA_PARCIAL').length,
    ENTREGA_TOTAL: empenhos.filter(e => e.status === 'ENTREGA_TOTAL').length,
    CANCELADO: empenhos.filter(e => e.status === 'CANCELADO').length,
  };

  const allTv = filtered.reduce((s, e) => s + totals(e).tv, 0);
  const allTc = filtered.reduce((s, e) => s + totals(e).tc, 0);
  const nfGroups = buildNFGroups(empenhos);
  const totalAguardando = nfGroups.filter(g => g.nfStatus === 'AGUARDANDO_PAGAMENTO').reduce((s, g) => s + g.totalVenda, 0);

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleNfExpand(key: string) {
    setNfExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  function openAdd() { setForm({ ...emptyForm, itens: [emptyItem()] }); setModal({ open: true, editing: null }); }
  function openEdit(e: Empenho) {
    setForm({ numero: e.numero, fornecedor: e.fornecedor, orgao: e.orgao, itens: e.itens.map(i => ({ ...i })), status: e.status, responsavelCompra: e.responsavelCompra, responsavelEntrega: e.responsavelEntrega, observacao: e.observacao });
    setModal({ open: true, editing: e });
  }
  function handleDelete(id: string, numero: string) { if (window.confirm(`Excluir empenho ${numero}?`)) deleteEmpenho(id); }
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
    const headers = ['Nº Empenho', 'Fornecedor', 'Órgão', 'Status', 'Resp. Compra', 'Resp. Entrega', 'Item #', 'Descrição', 'Und', 'Marca', 'Qtd', 'Vlr Venda', 'Total Venda', 'Qtd Entregue', 'Falta Entregar', 'Vlr Custo', 'Total Custo', 'NF', 'Valor NF', 'Data Entrega NF', 'Status NF', 'Data Pagamento', 'Criado em'];
    const rows: (string | number)[][] = [];
    filtered.forEach(e => {
      e.itens.forEach((it, idx) => {
        rows.push([e.numero, e.fornecedor, e.orgao, e.status, e.responsavelCompra, e.responsavelEntrega, idx + 1, it.descricao, it.und, it.marca, it.qtd, it.valorVenda, it.qtd * it.valorVenda, it.qtdEntregue, it.qtd - it.qtdEntregue, it.valorCusto, it.qtdEntregue * it.valorCusto, it.nf, it.valorNf, it.dataEntregaNf, it.nfStatus, it.nfDataPagamento, e.createdAt]);
      });
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `empenhos-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const modalTv = form.itens.reduce((s, i) => s + i.qtd * i.valorVenda, 0);
  const modalTc = form.itens.reduce((s, i) => s + i.qtdEntregue * i.valorCusto, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        {([
          { key: 'empenhos', label: 'Empenhos' },
          { key: 'notas', label: 'Notas Fiscais' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-[13px] font-medium transition-all relative"
            style={{ color: tab === t.key ? '#2563eb' : '#6b7280' }}>
            {t.label}
            {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: '#2563eb' }} />}
          </button>
        ))}
      </div>

      {/* ── TAB: EMPENHOS ── */}
      {tab === 'empenhos' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Venda', value: fmt(allTv), color: '#111827' },
              { label: 'Total Custo', value: fmt(allTc), color: '#6b7280' },
              { label: 'Empenhos', value: filtered.length, color: '#111827' },
              { label: 'Itens', value: filtered.reduce((s, e) => s + e.itens.length, 0), color: '#6b7280' },
            ].map(s => (
              <div key={s.label} className="surface rounded-xl px-4 py-3.5">
                <p className="text-[11px]" style={{ color: '#9ca3af' }}>{s.label}</p>
                <p className="text-base font-semibold tabular-nums mt-0.5" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1">
            {(['TODOS', 'PENDENTE', 'EM_ENTREGA', 'ENTREGA_PARCIAL', 'ENTREGA_TOTAL', 'CANCELADO'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                style={{ background: filter === f ? '#eff6ff' : 'transparent', color: filter === f ? '#1d4ed8' : '#9ca3af', border: filter === f ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent' }}>
                {f === 'TODOS' ? 'Todos' : STATUS_LABELS[f as EmpenhoStatus]}
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
                    <th>Total Custo</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const { tv, tc } = totals(e);
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
                        <td className="tabular-nums font-medium" style={{ color: '#6b7280' }}>{fmt(tc)}</td>
                        <td><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_BADGE[e.status]}`}>{STATUS_LABELS[e.status]}</span></td>
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
                            <div className="px-8 py-3" style={{ background: '#f9fafb', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                              <div className="overflow-x-auto">
                                <table className="w-full" style={{ fontSize: 12 }}>
                                  <thead>
                                    <tr>
                                      {['#', 'Descrição', 'Und', 'Marca', 'Qtd', 'Vlr Venda', 'Total', 'Qtd Entregue', 'Vlr Custo', 'Total Custo', 'Falta Entregar', 'NF', 'Valor NF', 'Data Entrega'].map(h => (
                                        <th key={h} className="text-left pb-2 pr-3 whitespace-nowrap" style={{ color: '#9ca3af', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {e.itens.map((it, idx) => {
                                      const itv = it.qtd * it.valorVenda;
                                      const itc = it.qtdEntregue * it.valorCusto;
                                      const alert = it.valorCusto > it.valorVenda;
                                      const falta = it.qtd - it.qtdEntregue;
                                      return (
                                        <tr key={it.id} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                          <td className="py-2 pr-3" style={{ color: '#9ca3af' }}>{idx + 1}</td>
                                          <td className="py-2 pr-3 truncate" style={{ color: '#374151', maxWidth: 200 }} title={it.descricao}>{it.descricao}</td>
                                          <td className="py-2 pr-3" style={{ color: '#6b7280' }}>{it.und}</td>
                                          <td className="py-2 pr-3" style={{ color: '#6b7280' }}>{it.marca || '—'}</td>
                                          <td className="py-2 pr-3 tabular-nums">{it.qtd}</td>
                                          <td className="py-2 pr-3 tabular-nums" style={{ color: '#6b7280' }}>{fmtFull(it.valorVenda)}</td>
                                          <td className="py-2 pr-3 tabular-nums font-medium" style={{ color: '#111827' }}>{fmt(itv)}</td>
                                          <td className="py-2 pr-3 tabular-nums" style={{ color: '#6b7280' }}>{it.qtdEntregue}</td>
                                          <td className="py-2 pr-3 tabular-nums font-medium" style={{ color: alert ? '#dc2626' : '#6b7280' }}>{fmtFull(it.valorCusto)}</td>
                                          <td className="py-2 pr-3 tabular-nums font-semibold" style={{ color: alert ? '#dc2626' : '#374151' }}>{fmt(itc)}</td>
                                          <td className="py-2 pr-3">
                                            <span className="tabular-nums font-semibold" style={{ color: falta > 0 ? '#d97706' : '#16a34a' }}>{falta}</span>
                                            <span className="block text-[9px]" style={{ color: '#9ca3af' }}>{it.qtd} ped. / {it.qtdEntregue} entregue</span>
                                          </td>
                                          <td className="py-2 pr-3 font-mono whitespace-nowrap" style={{ color: '#2563eb' }}>{it.nf || '—'}</td>
                                          <td className="py-2 pr-3 tabular-nums" style={{ color: '#374151' }}>{it.valorNf ? fmt(it.valorNf) : '—'}</td>
                                          <td className="py-2 whitespace-nowrap" style={{ color: '#6b7280' }}>{it.dataEntregaNf || '—'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot>
                                    <tr style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                      <td colSpan={6} className="pt-2 pb-1 pr-3 text-[10px]" style={{ color: '#9ca3af' }}>Total do empenho</td>
                                      <td className="pt-2 pb-1 pr-3 tabular-nums font-semibold" style={{ color: '#111827' }}>{fmt(tv)}</td>
                                      <td colSpan={2} />
                                      <td className="pt-2 pb-1 tabular-nums font-semibold" style={{ color: '#6b7280' }}>{fmt(tc)}</td>
                                      <td colSpan={4} />
                                    </tr>
                                  </tfoot>
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
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums" style={{ color: '#6b7280' }}>{fmt(allTc)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: NOTAS FISCAIS ── */}
      {tab === 'notas' && (
        <div className="space-y-4">
          <div className="surface rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>Notas Fiscais</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}>{nfGroups.length} NFs</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-premium">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Nota Fiscal</th>
                    <th>Empenho</th>
                    <th>Órgão</th>
                    <th>Itens</th>
                    <th>Valor da Nota</th>
                    <th>Total Custo</th>
                    <th>Status</th>
                    <th>Data Pagamento</th>
                    <th>Arquivo / Documento</th>
                  </tr>
                </thead>
                <tbody>
                  {nfGroups.map(g => {
                    const isExp = nfExpanded.has(g.key);
                    return [
                      <tr key={g.key} className="group">
                        <td>
                          <button onClick={() => toggleNfExpand(g.key)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                            {isExp ? <ChevronDown className="w-3.5 h-3.5" style={{ color: '#6b7280' }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />}
                          </button>
                        </td>
                        <td><span className="font-mono text-[12px] font-semibold" style={{ color: '#2563eb' }}>{g.nfNumero}</span></td>
                        <td><span className="font-mono text-[11px]" style={{ color: '#6b7280' }}>{g.empenhoNumero}</span></td>
                        <td className="max-w-[160px] truncate" title={g.orgao} style={{ color: '#374151' }}>{g.orgao}</td>
                        <td>
                          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}>
                            {g.itens.length} {g.itens.length === 1 ? 'item' : 'itens'}
                          </span>
                        </td>
                        <td className="tabular-nums font-semibold" style={{ color: '#111827' }}>{fmt(g.totalVenda)}</td>
                        <td className="tabular-nums" style={{ color: '#6b7280' }}>{fmt(g.totalCusto)}</td>
                        <td>
                          <select
                            value={g.nfStatus}
                            onChange={ev => updateNFStatus(g.empenhoId, g.nfNumero, { nfStatus: ev.target.value as NfStatus })}
                            className="text-[11px] font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer"
                            style={{
                              background: g.nfStatus === 'PAGAMENTO_EFETUADO' ? 'rgba(22,163,74,0.1)' : g.nfStatus === 'NOTA_CANCELADA' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                              color: g.nfStatus === 'PAGAMENTO_EFETUADO' ? '#16a34a' : g.nfStatus === 'NOTA_CANCELADA' ? '#dc2626' : '#d97706',
                            }}>
                            <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
                            <option value="PAGAMENTO_EFETUADO">Pagamento Efetuado</option>
                            <option value="NOTA_CANCELADA">Nota Cancelada</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="date"
                            value={g.nfDataPagamento}
                            onChange={ev => updateNFStatus(g.empenhoId, g.nfNumero, { nfDataPagamento: ev.target.value })}
                            className="input-premium text-[12px]"
                            style={{ width: 130 }}
                          />
                        </td>
                        <td>
                          <input
                            value={g.nfArquivo}
                            onChange={ev => updateNFStatus(g.empenhoId, g.nfNumero, { nfArquivo: ev.target.value })}
                            className="input-premium text-[12px]"
                            style={{ width: 160 }}
                            placeholder="Nome do arquivo..."
                          />
                        </td>
                      </tr>,
                      isExp && (
                        <tr key={`${g.key}-exp`}>
                          <td colSpan={10} style={{ padding: 0 }}>
                            <div className="px-10 py-3" style={{ background: '#f9fafb', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                              <div className="overflow-x-auto">
                                <table className="w-full" style={{ fontSize: 12 }}>
                                  <thead>
                                    <tr>
                                      {['#', 'Descrição', 'Und', 'Qtd', 'Vlr Venda', 'Total Venda', 'Qtd Entregue', 'Vlr Custo', 'Total Custo', 'Falta Entregar'].map(h => (
                                        <th key={h} className="text-left pb-2 pr-3 whitespace-nowrap" style={{ color: '#9ca3af', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {g.itens.map((it, idx) => {
                                      const itv = it.qtd * it.valorVenda;
                                      const itc = it.qtdEntregue * it.valorCusto;
                                      const alert = it.valorCusto > it.valorVenda;
                                      const falta = it.qtd - it.qtdEntregue;
                                      return (
                                        <tr key={it.id} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                          <td className="py-1.5 pr-3" style={{ color: '#9ca3af' }}>{idx + 1}</td>
                                          <td className="py-1.5 pr-3 truncate" style={{ color: '#374151', maxWidth: 220 }} title={it.descricao}>{it.descricao}</td>
                                          <td className="py-1.5 pr-3" style={{ color: '#6b7280' }}>{it.und}</td>
                                          <td className="py-1.5 pr-3 tabular-nums">{it.qtd}</td>
                                          <td className="py-1.5 pr-3 tabular-nums" style={{ color: '#6b7280' }}>{fmtFull(it.valorVenda)}</td>
                                          <td className="py-1.5 pr-3 tabular-nums font-medium" style={{ color: '#111827' }}>{fmt(itv)}</td>
                                          <td className="py-1.5 pr-3 tabular-nums" style={{ color: '#6b7280' }}>{it.qtdEntregue}</td>
                                          <td className="py-1.5 pr-3 tabular-nums" style={{ color: alert ? '#dc2626' : '#6b7280' }}>{fmtFull(it.valorCusto)}</td>
                                          <td className="py-1.5 pr-3 tabular-nums font-semibold" style={{ color: alert ? '#dc2626' : '#374151' }}>{fmt(itc)}</td>
                                          <td className="py-1.5">
                                            <span className="tabular-nums font-semibold" style={{ color: falta > 0 ? '#d97706' : '#16a34a' }}>{falta}</span>
                                            <span className="block text-[9px]" style={{ color: '#9ca3af' }}>{it.qtd} ped. / {it.qtdEntregue} entregue</span>
                                          </td>
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
                  {nfGroups.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-[13px]" style={{ color: '#9ca3af' }}>
                        Nenhuma nota fiscal cadastrada. Adicione NFs nos itens dos empenhos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer: total aguardando pagamento */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
              <span className="text-[12px]" style={{ color: '#9ca3af' }}>Soma total das notas aguardando pagamento</span>
              <span className="text-sm font-semibold tabular-nums" style={{ color: '#d97706' }}>{fmt(totalAguardando)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>{modal.editing ? 'Editar Empenho' : 'Novo Empenho'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" style={{ color: '#6b7280' }} /></button>
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
                      {(Object.keys(STATUS_LABELS) as EmpenhoStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
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
                          <th style={{ width: 28 }}>#</th>
                          <th>Descrição</th>
                          <th>Und</th>
                          <th>Marca</th>
                          <th>Qtd</th>
                          <th>Vlr Venda</th>
                          <th>Qtd Entregue</th>
                          <th>Falta Entregar</th>
                          <th>Vlr Custo</th>
                          <th>Total Custo</th>
                          <th>NF</th>
                          <th>Valor NF</th>
                          <th>Data Entrega</th>
                          <th style={{ width: 36 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.itens.map((it, idx) => {
                          const alert = it.valorCusto > it.valorVenda;
                          const falta = it.qtd - it.qtdEntregue;
                          return (
                            <tr key={it.id}>
                              <td style={{ color: '#9ca3af', fontSize: 11 }}>{idx + 1}</td>
                              <td><input value={it.descricao} onChange={e => updateItem(idx, 'descricao', e.target.value)} className="input-premium" style={{ minWidth: 170 }} placeholder="Descrição do item" /></td>
                              <td><input value={it.und} onChange={e => updateItem(idx, 'und', e.target.value)} className="input-premium" style={{ width: 52 }} /></td>
                              <td><input value={it.marca} onChange={e => updateItem(idx, 'marca', e.target.value)} className="input-premium" style={{ width: 76 }} /></td>
                              <td><input type="number" value={it.qtd} onChange={e => updateItem(idx, 'qtd', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 64 }} /></td>
                              <td><input type="number" step="0.01" value={it.valorVenda} onChange={e => updateItem(idx, 'valorVenda', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 88 }} /></td>
                              <td><input type="number" value={it.qtdEntregue} onChange={e => updateItem(idx, 'qtdEntregue', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 72 }} /></td>
                              <td className="tabular-nums text-center text-[12px] font-semibold" style={{ color: falta > 0 ? '#d97706' : '#16a34a' }}>{falta}</td>
                              <td><input type="number" step="0.01" value={it.valorCusto} onChange={e => updateItem(idx, 'valorCusto', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 88, color: alert ? '#dc2626' : undefined }} /></td>
                              <td className="tabular-nums text-[12px] font-semibold" style={{ color: alert ? '#dc2626' : '#374151' }}>{fmt(it.qtdEntregue * it.valorCusto)}</td>
                              <td><input value={it.nf} onChange={e => updateItem(idx, 'nf', e.target.value)} className="input-premium" style={{ width: 96 }} placeholder="NF-000000" /></td>
                              <td><input type="number" step="0.01" value={it.valorNf} onChange={e => updateItem(idx, 'valorNf', parseFloat(e.target.value) || 0)} className="input-premium" style={{ width: 88 }} /></td>
                              <td><input type="date" value={it.dataEntregaNf} onChange={e => updateItem(idx, 'dataEntregaNf', e.target.value)} className="input-premium" style={{ width: 126 }} /></td>
                              <td>
                                <button onClick={() => removeItem(idx)} disabled={form.itens.length <= 1} className="p-1.5 rounded-md hover:bg-red-50 disabled:opacity-30">
                                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {form.itens.length === 0 && (
                          <tr><td colSpan={14} className="py-8 text-center text-[12px]" style={{ color: '#9ca3af' }}>Clique em &quot;Adicionar Item&quot;</td></tr>
                        )}
                      </tbody>
                      {form.itens.length > 0 && (
                        <tfoot>
                          <tr style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: '#f9fafb' }}>
                            <td colSpan={4} className="px-4 py-2.5 text-[11px]" style={{ color: '#9ca3af' }}>Total ({form.itens.length} itens)</td>
                            <td />
                            <td className="px-4 py-2.5 text-[12px] font-semibold tabular-nums" style={{ color: '#111827' }}>{fmt(modalTv)}</td>
                            <td colSpan={3} />
                            <td className="px-4 py-2.5 text-[12px] font-semibold tabular-nums" style={{ color: '#6b7280' }}>{fmt(modalTc)}</td>
                            <td colSpan={4} />
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
