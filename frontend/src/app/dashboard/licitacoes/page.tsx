'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { useDemoStore, Licitacao, LicitacaoStatus, LicitacaoModalidade } from '@/store/demoStore';

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

const modalidadeLabels: Record<LicitacaoModalidade, string> = {
  PREGAO_ELETRONICO: 'Pregão Eletrônico', PREGAO_PRESENCIAL: 'Pregão Presencial',
  CONCORRENCIA: 'Concorrência', TOMADA_PRECOS: 'Tomada de Preços',
  CONVITE: 'Convite', DISPENSA: 'Dispensa de Licitação',
};

const emptyForm: Omit<Licitacao, 'id' | 'createdAt'> = {
  numero: '', objeto: '', orgao: '', modalidade: 'PREGAO_ELETRONICO',
  valorEstimado: 0, dataAbertura: '', status: 'ABERTA',
  edital: '', responsavel: '', observacao: '',
};

const statusConfig: Record<LicitacaoStatus, { label: string; cls: string }> = {
  ABERTA: { label: 'Aberta', cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  EM_ANDAMENTO: { label: 'Em Andamento', cls: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
  CONCLUIDA: { label: 'Concluída', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  CANCELADA: { label: 'Cancelada', cls: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  SUSPENSA: { label: 'Suspensa', cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
};

export default function LicitacoesPage() {
  const { licitacoes, addLicitacao, updateLicitacao, deleteLicitacao } = useDemoStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LicitacaoStatus | 'TODAS'>('TODAS');
  const [modal, setModal] = useState<{ open: boolean; editing: Licitacao | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Licitacao, 'id' | 'createdAt'>>(emptyForm);

  const filtered = licitacoes
    .filter(l => filterStatus === 'TODAS' || l.status === filterStatus)
    .filter(l => !search || l.numero.toLowerCase().includes(search.toLowerCase()) || l.objeto.toLowerCase().includes(search.toLowerCase()) || l.orgao.toLowerCase().includes(search.toLowerCase()));

  const counts: Record<string, number> = { TODAS: licitacoes.length };
  licitacoes.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });

  function openAdd() { setForm(emptyForm); setModal({ open: true, editing: null }); }
  function openEdit(l: Licitacao) {
    setForm({ numero: l.numero, objeto: l.objeto, orgao: l.orgao, modalidade: l.modalidade, valorEstimado: l.valorEstimado, dataAbertura: l.dataAbertura, status: l.status, edital: l.edital, responsavel: l.responsavel, observacao: l.observacao });
    setModal({ open: true, editing: l });
  }
  function handleDelete(id: string, numero: string) {
    if (window.confirm(`Confirmar exclusão da licitação ${numero}?`)) deleteLicitacao(id);
  }
  function handleSave() {
    if (modal.editing) updateLicitacao(modal.editing.id, form);
    else addLicitacao(form);
    setModal({ open: false, editing: null });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-title glow-title">Licitações</h1>
          <p className="text-slate-400 mt-1">Gerencie processos licitatórios</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-500/25">
          <Plus className="w-4 h-4" /> Nova Licitação
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: licitacoes.length, color: 'text-white' },
          { label: 'Abertas', value: counts['ABERTA'] || 0, color: 'text-blue-400' },
          { label: 'Em Andamento', value: counts['EM_ANDAMENTO'] || 0, color: 'text-violet-400' },
          { label: 'Concluídas', value: counts['CONCLUIDA'] || 0, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar licitação..." className="pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all w-64" />
        </div>
        {(['TODAS', 'ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'SUSPENSA'] as const).map(f => (
          <button key={f} onClick={() => setFilterStatus(f)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterStatus === f ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white' : 'glass-card text-slate-400 hover:text-white'}`}>
            {f === 'TODAS' ? 'Todas' : statusConfig[f as LicitacaoStatus]?.label || f}
            <span className={`px-1.5 py-0.5 rounded-full ${filterStatus === f ? 'bg-white/20' : 'bg-white/10'}`}>{counts[f] || 0}</span>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(l => (
          <div key={l.id} className="glass-card glass-card-hover rounded-2xl p-5 group transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-blue-300">{l.numero}</span>
                <h3 className="text-sm font-semibold text-white mt-0.5 leading-tight">{l.objeto}</h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(l.id, l.numero)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">{l.orgao}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[l.status].cls}`}>{statusConfig[l.status].label}</span>
                <span className="text-xs text-slate-500">{modalidadeLabels[l.modalidade]}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{fmt(l.valorEstimado)}</p>
                <p className="text-xs text-slate-500">{l.dataAbertura ? new Date(l.dataAbertura + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
              </div>
            </div>
            {l.observacao && <p className="text-xs text-slate-500 mt-2 border-t border-white/[0.05] pt-2">{l.observacao}</p>}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-xl font-bold gradient-title">{modal.editing ? 'Editar Licitação' : 'Nova Licitação'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                { label: 'Número', key: 'numero' },
                { label: 'Órgão', key: 'orgao' },
                { label: 'Objeto', key: 'objeto', full: true },
                { label: 'Valor Estimado', key: 'valorEstimado', type: 'number' },
                { label: 'Data Abertura', key: 'dataAbertura', type: 'date' },
                { label: 'Responsável', key: 'responsavel' },
                { label: 'Edital', key: 'edital' },
              ] as { label: string; key: keyof Omit<Licitacao, 'id' | 'createdAt'>; type?: string; full?: boolean }[]).map(({ label, key, type, full }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type || 'text'}
                    value={form[key] as string | number}
                    onChange={ev => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(ev.target.value) || 0 : ev.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Modalidade</label>
                <select value={form.modalidade} onChange={ev => setForm(f => ({ ...f, modalidade: ev.target.value as LicitacaoModalidade }))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all">
                  {Object.entries(modalidadeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select value={form.status} onChange={ev => setForm(f => ({ ...f, status: ev.target.value as LicitacaoStatus }))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all">
                  {Object.entries(statusConfig).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Observação</label>
                <textarea value={form.observacao} onChange={ev => setForm(f => ({ ...f, observacao: ev.target.value }))} rows={2}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-white/[0.08]">
              <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white text-sm font-medium">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-violet-500/25">
                {modal.editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
