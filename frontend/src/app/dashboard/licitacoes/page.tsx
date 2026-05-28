'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Download } from 'lucide-react';
import { useDemoStore, Licitacao, LicitacaoStatus, LicitacaoModalidade } from '@/store/demoStore';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }

const modalidadeLabel: Record<LicitacaoModalidade, string> = {
  PREGAO_ELETRONICO: 'Pregão Eletrônico', PREGAO_PRESENCIAL: 'Pregão Presencial',
  CONCORRENCIA: 'Concorrência', TOMADA_PRECOS: 'Tomada de Preços',
  CONVITE: 'Convite', DISPENSA: 'Dispensa',
};

const statusCfg: Record<LicitacaoStatus, { label: string; badge: string }> = {
  ABERTA: { label: 'Aberta', badge: 'badge-success' },
  EM_ANDAMENTO: { label: 'Em Andamento', badge: 'badge-blue' },
  CONCLUIDA: { label: 'Concluída', badge: 'badge-neutral' },
  CANCELADA: { label: 'Cancelada', badge: 'badge-danger' },
  SUSPENSA: { label: 'Suspensa', badge: 'badge-warning' },
};

const emptyForm: Omit<Licitacao, 'id' | 'createdAt'> = {
  numero: '', objeto: '', orgao: '', modalidade: 'PREGAO_ELETRONICO',
  valorEstimado: 0, dataAbertura: '', status: 'ABERTA', edital: '', responsavel: '', observacao: '',
};

export default function LicitacoesPage() {
  const { licitacoes, addLicitacao, updateLicitacao, deleteLicitacao, loadFromDB } = useDemoStore();

  useEffect(() => { loadFromDB(); }, [loadFromDB]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LicitacaoStatus | 'TODOS'>('TODOS');
  const [modal, setModal] = useState<{ open: boolean; editing: Licitacao | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Licitacao, 'id' | 'createdAt'>>(emptyForm);

  const filtered = licitacoes
    .filter(l => filterStatus === 'TODOS' || l.status === filterStatus)
    .filter(l => !search || [l.numero, l.objeto, l.orgao].some(s => s.toLowerCase().includes(search.toLowerCase())));

  const counts: Record<string, number> = { TODOS: licitacoes.length };
  licitacoes.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });

  function exportCSV() {
    const headers = ['Número','Objeto','Órgão','Modalidade','Valor Estimado','Data Abertura','Status','Edital','Responsável','Observação','Criado em'];
    const rows = filtered.map(l => [l.numero,l.objeto,l.orgao,modalidadeLabel[l.modalidade],l.valorEstimado,l.dataAbertura,statusCfg[l.status].label,l.edital,l.responsavel,l.observacao,l.createdAt]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `licitacoes-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function openAdd() { setForm(emptyForm); setModal({ open: true, editing: null }); }
  function openEdit(l: Licitacao) {
    setForm({ numero: l.numero, objeto: l.objeto, orgao: l.orgao, modalidade: l.modalidade, valorEstimado: l.valorEstimado, dataAbertura: l.dataAbertura, status: l.status, edital: l.edital, responsavel: l.responsavel, observacao: l.observacao });
    setModal({ open: true, editing: l });
  }
  function handleDelete(id: string, numero: string) {
    if (window.confirm(`Excluir ${numero}?`)) deleteLicitacao(id);
  }
  function handleSave() {
    if (modal.editing) updateLicitacao(modal.editing.id, form);
    else addLicitacao(form);
    setModal({ open: false, editing: null });
  }

  const inputCls = 'input-premium';

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#f0f0f2', letterSpacing: '-0.02em' }}>Licitações</h1>
          <p className="text-sm mt-0.5" style={{ color: '#44444f' }}>Processos licitatórios</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Nova Licitação
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: licitacoes.length, color: '#f0f0f2' },
          { label: 'Abertas', value: counts['ABERTA'] || 0, color: '#4ade80' },
          { label: 'Em Andamento', value: counts['EM_ANDAMENTO'] || 0, color: '#60a5fa' },
          { label: 'Concluídas', value: counts['CONCLUIDA'] || 0, color: '#7f7f8c' },
        ].map(s => (
          <div key={s.label} className="surface rounded-xl px-4 py-3.5">
            <p className="text-[11px]" style={{ color: '#44444f' }}>{s.label}</p>
            <p className="text-2xl font-semibold tabular-nums mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#44444f' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            className="input-premium pl-8 w-56 text-[12px]" style={{ padding: '7px 12px 7px 32px' }} />
        </div>
        <div className="flex gap-1">
          {(['TODOS', 'ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'SUSPENSA'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: filterStatus === f ? '#1c1c28' : 'transparent',
                color: filterStatus === f ? '#d4d4f0' : '#44444f',
                border: filterStatus === f ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              }}>
              {f === 'TODOS' ? 'Todos' : f === 'EM_ANDAMENTO' ? 'Andamento' : statusCfg[f as LicitacaoStatus]?.label}
              {' '}({counts[f] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(l => (
          <div key={l.id} className="surface surface-hover rounded-xl p-5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[11px]" style={{ color: '#60a5fa' }}>{l.numero}</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusCfg[l.status].badge}`}>{statusCfg[l.status].label}</span>
                </div>
                <p className="text-sm font-medium leading-tight" style={{ color: '#d4d4d8' }}>{l.objeto}</p>
                <p className="text-[12px] mt-1" style={{ color: '#44444f' }}>{l.orgao}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => openEdit(l)} className="p-1.5 rounded-md" style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.08)' }}>
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(l.id, l.numero)} className="p-1.5 rounded-md" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[11px]" style={{ color: '#44444f' }}>{modalidadeLabel[l.modalidade]}</span>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums" style={{ color: '#f0f0f2' }}>{fmt(l.valorEstimado)}</p>
                {l.dataAbertura && <p className="text-[10px]" style={{ color: '#44444f' }}>{new Date(l.dataAbertura + 'T12:00:00').toLocaleDateString('pt-BR')}</p>}
              </div>
            </div>
            {l.observacao && <p className="text-[11px] mt-2" style={{ color: '#44444f' }}>{l.observacao}</p>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <p className="text-sm" style={{ color: '#44444f' }}>Nenhuma licitação encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>{modal.editing ? 'Editar Licitação' : 'Nova Licitação'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 rounded-md" style={{ color: '#44444f' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                { label: 'Número', key: 'numero' },
                { label: 'Órgão', key: 'orgao' },
                { label: 'Objeto', key: 'objeto', full: true },
                { label: 'Valor Estimado (R$)', key: 'valorEstimado', type: 'number' },
                { label: 'Data de Abertura', key: 'dataAbertura', type: 'date' },
                { label: 'Responsável', key: 'responsavel' },
                { label: 'Edital', key: 'edital' },
              ] as { label: string; key: keyof Omit<Licitacao, 'id' | 'createdAt'>; type?: string; full?: boolean }[]).map(({ label, key, type, full }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>{label}</label>
                  <input type={type || 'text'} value={form[key] as string | number}
                    onChange={ev => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(ev.target.value) || 0 : ev.target.value }))}
                    className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>Modalidade</label>
                <select value={form.modalidade} onChange={ev => setForm(f => ({ ...f, modalidade: ev.target.value as LicitacaoModalidade }))} className={inputCls} style={{ background: '#161619' }}>
                  {Object.entries(modalidadeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>Status</label>
                <select value={form.status} onChange={ev => setForm(f => ({ ...f, status: ev.target.value as LicitacaoStatus }))} className={inputCls} style={{ background: '#161619' }}>
                  {Object.entries(statusCfg).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: '#7f7f8c' }}>Observação</label>
                <textarea value={form.observacao} onChange={ev => setForm(f => ({ ...f, observacao: ev.target.value }))} rows={2} className={inputCls} style={{ resize: 'none' }} />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setModal({ open: false, editing: null })} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} className="btn-primary flex-1">{modal.editing ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
