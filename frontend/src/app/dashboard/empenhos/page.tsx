'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle, Download, ChevronDown, ChevronRight, FileText, Upload, ExternalLink, Loader2 } from 'lucide-react';
import { useDemoStore, Empenho, EmpenhoItem, EmpenhoStatus, NfStatus, NotaFiscal } from '@/store/demoStore';
import { dbStorage } from '@/services/db.service';
import { toast } from 'sonner';

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
const NF_STATUS_LABELS_MAP: Record<NfStatus, string> = {
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

// ─── Notas Fiscais (aba independente) ──────────────────────────

const emptyNf = (): Omit<NotaFiscal, 'id' | 'createdAt'> => ({
  numeroNf: '', numeroEmpenho: '', fornecedor: '', orgao: '',
  valor: 0, dataEntrega: '', status: 'AGUARDANDO_PAGAMENTO',
  dataPagamento: '', arquivos: [], observacao: '',
});

function NotasFiscaisTab() {
  const { notasFiscais, empenhos, addNotaFiscal, updateNotaFiscal, deleteNotaFiscal } = useDemoStore();
  const [modal, setModal] = useState<{ open: boolean; editing: NotaFiscal | null }>({ open: false, editing: null });
  const [form, setForm] = useState(emptyNf());
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Migração única: importa NFs dos itens de empenhos para a nova tabela independente
  useEffect(() => {
    if (notasFiscais.length > 0) return; // já tem dados, não migra
    const seen = new Set<string>();
    empenhos.forEach(e => {
      e.itens.forEach(it => {
        if (!it.nf) return;
        const key = `${e.id}_${it.nf}`;
        if (seen.has(key)) return;
        seen.add(key);
        // Agrupa itens com mesma NF no mesmo empenho
        const itensNf = e.itens.filter(i => i.nf === it.nf);
        const totalValor = itensNf.reduce((s, i) => s + i.valorNf, 0) || itensNf.reduce((s, i) => s + i.qtd * i.valorVenda, 0);
        addNotaFiscal({
          numeroNf: it.nf,
          numeroEmpenho: e.numero,
          fornecedor: e.fornecedor,
          orgao: e.orgao,
          valor: totalValor,
          dataEntrega: it.dataEntregaNf || '',
          status: it.nfStatus || 'AGUARDANDO_PAGAMENTO',
          dataPagamento: it.nfDataPagamento || '',
          arquivos: it.nfArquivo ? [it.nfArquivo] : [],
          observacao: '',
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empenhos]);

  const totalAguardando = notasFiscais
    .filter(n => n.status === 'AGUARDANDO_PAGAMENTO')
    .reduce((s, n) => s + n.valor, 0);

  function openAdd() { setForm(emptyNf()); setFiles([]); setModal({ open: true, editing: null }); }
  function openEdit(nf: NotaFiscal) {
    setForm({ numeroNf: nf.numeroNf, numeroEmpenho: nf.numeroEmpenho, fornecedor: nf.fornecedor, orgao: nf.orgao, valor: nf.valor, dataEntrega: nf.dataEntrega, status: nf.status, dataPagamento: nf.dataPagamento, arquivos: nf.arquivos, observacao: nf.observacao });
    setFiles([]);
    setModal({ open: true, editing: nf });
  }

  async function handleSave() {
    if (!form.numeroNf) { toast.error('Informe o número da NF'); return; }
    setUploading(true);
    const novosUrls: string[] = [];
    for (const file of files) {
      const url = await dbStorage.uploadNfFile(file);
      if (url) novosUrls.push(url);
    }
    const arquivosFinais = [...(form.arquivos || []), ...novosUrls];
    if (modal.editing) {
      updateNotaFiscal(modal.editing.id, { ...form, arquivos: arquivosFinais });
      toast.success('NF atualizada!');
    } else {
      addNotaFiscal({ ...form, arquivos: arquivosFinais });
      toast.success('NF cadastrada!');
    }
    setUploading(false);
    setModal({ open: false, editing: null });
  }

  function removeArquivo(url: string) {
    setForm(f => ({ ...f, arquivos: f.arquivos.filter(a => a !== url) }));
    if (modal.editing) updateNotaFiscal(modal.editing.id, { arquivos: form.arquivos.filter(a => a !== url) });
  }

  const statusColor = (s: NfStatus) =>
    s === 'PAGAMENTO_EFETUADO' ? { bg: 'rgba(22,163,74,0.1)', color: '#16a34a' }
    : s === 'NOTA_CANCELADA' ? { bg: 'rgba(220,38,38,0.1)', color: '#dc2626' }
    : { bg: 'rgba(217,119,6,0.1)', color: '#d97706' };

  return (
    <div className="space-y-4">
      <div className="surface rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>Notas Fiscais</p>
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}>{notasFiscais.length} NFs</span>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-[12px] py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" /> Nova NF
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Nota Fiscal</th>
                <th>Nº Empenho</th>
                <th>Fornecedor</th>
                <th>Órgão</th>
                <th>Valor</th>
                <th>Data Entrega</th>
                <th>Status</th>
                <th>Data Pagamento</th>
                <th>Arquivos</th>
                <th>Observação</th>
                <th style={{ width: 72 }}></th>
              </tr>
            </thead>
            <tbody>
              {notasFiscais.map(nf => {
                const sc = statusColor(nf.status);
                return (
                  <tr key={nf.id} className="group">
                    <td><span className="font-mono text-[12px] font-semibold" style={{ color: '#2563eb' }}>{nf.numeroNf}</span></td>
                    <td>
                      <input value={nf.numeroEmpenho} onChange={e => updateNotaFiscal(nf.id, { numeroEmpenho: e.target.value })}
                        className="input-premium text-[12px]" style={{ width: 130 }} placeholder="Nº Empenho" />
                    </td>
                    <td>
                      <input value={nf.fornecedor} onChange={e => updateNotaFiscal(nf.id, { fornecedor: e.target.value })}
                        className="input-premium text-[12px]" style={{ minWidth: 140 }} placeholder="Fornecedor" />
                    </td>
                    <td>
                      <input value={nf.orgao} onChange={e => updateNotaFiscal(nf.id, { orgao: e.target.value })}
                        className="input-premium text-[12px]" style={{ minWidth: 130 }} placeholder="Órgão" />
                    </td>
                    <td>
                      <input type="number" step="0.01" value={nf.valor} onChange={e => updateNotaFiscal(nf.id, { valor: parseFloat(e.target.value) || 0 })}
                        className="input-premium text-[12px] tabular-nums" style={{ width: 110 }} />
                    </td>
                    <td>
                      <input type="date" value={nf.dataEntrega} onChange={e => updateNotaFiscal(nf.id, { dataEntrega: e.target.value })}
                        className="input-premium text-[12px]" style={{ width: 130 }} />
                    </td>
                    <td>
                      <select value={nf.status} onChange={e => updateNotaFiscal(nf.id, { status: e.target.value as NfStatus })}
                        className="text-[11px] font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer"
                        style={{ background: sc.bg, color: sc.color }}>
                        {(Object.keys(NF_STATUS_LABELS_MAP) as NfStatus[]).map(k => (
                          <option key={k} value={k}>{NF_STATUS_LABELS_MAP[k]}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input type="date" value={nf.dataPagamento} onChange={e => updateNotaFiscal(nf.id, { dataPagamento: e.target.value })}
                        className="input-premium text-[12px]" style={{ width: 130 }} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 items-center">
                        {nf.arquivos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(37,99,235,0.08)', color: '#2563eb' }}>
                            <ExternalLink className="w-2.5 h-2.5" /> Arq {i + 1}
                          </a>
                        ))}
                        {/* Upload inline */}
                        <label className="flex items-center gap-0.5 text-[11px] cursor-pointer px-1.5 py-0.5 rounded transition-colors"
                          style={{ background: 'rgba(0,0,0,0.04)', color: '#9ca3af' }}
                          title="Adicionar arquivo">
                          <Upload className="w-2.5 h-2.5" /> +
                          <input type="file" className="hidden" accept=".pdf,.xml,.jpg,.jpeg,.png,.webp" multiple
                            onChange={async e => {
                              const picked = Array.from(e.target.files ?? []);
                              if (!picked.length) return;
                              const urls: string[] = [];
                              for (const f of picked) { const u = await dbStorage.uploadNfFile(f); if (u) urls.push(u); }
                              updateNotaFiscal(nf.id, { arquivos: [...nf.arquivos, ...urls] });
                              toast.success(`${urls.length} arquivo(s) adicionado(s)`);
                            }} />
                        </label>
                      </div>
                    </td>
                    <td>
                      <input value={nf.observacao} onChange={e => updateNotaFiscal(nf.id, { observacao: e.target.value })}
                        className="input-premium text-[12px]" style={{ minWidth: 120 }} placeholder="Observação..." />
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(nf)} className="p-1.5 rounded-md hover:bg-gray-100">
                          <Pencil className="w-3 h-3" style={{ color: '#6b7280' }} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Excluir NF ${nf.numeroNf}?`)) deleteNotaFiscal(nf.id); }}
                          className="p-1.5 rounded-md hover:bg-red-50">
                          <Trash2 className="w-3 h-3" style={{ color: '#dc2626' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {notasFiscais.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[13px]" style={{ color: '#9ca3af' }}>
                    Nenhuma nota fiscal cadastrada. Clique em &quot;Nova NF&quot; para adicionar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé totais */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
          <span className="text-[12px]" style={{ color: '#9ca3af' }}>Total aguardando pagamento</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: '#d97706' }}>
            {totalAguardando.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {/* Modal Nova / Editar NF */}
      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>{modal.editing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}</h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" style={{ color: '#6b7280' }} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Número da NF *</label>
                  <input value={form.numeroNf} onChange={e => setForm(f => ({ ...f, numeroNf: e.target.value }))} className="input-premium" placeholder="NF-000000" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Nº do Empenho</label>
                  <input value={form.numeroEmpenho} onChange={e => setForm(f => ({ ...f, numeroEmpenho: e.target.value }))} className="input-premium" placeholder="2026NE000001" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Fornecedor</label>
                  <input value={form.fornecedor} onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))} className="input-premium" placeholder="Razão social" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Órgão</label>
                  <input value={form.orgao} onChange={e => setForm(f => ({ ...f, orgao: e.target.value }))} className="input-premium" placeholder="Órgão" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Valor (R$)</label>
                  <input type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: parseFloat(e.target.value) || 0 }))} className="input-premium" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Data de Entrega</label>
                  <input type="date" value={form.dataEntrega} onChange={e => setForm(f => ({ ...f, dataEntrega: e.target.value }))} className="input-premium" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as NfStatus }))} className="input-premium select">
                    {(Object.keys(NF_STATUS_LABELS_MAP) as NfStatus[]).map(k => <option key={k} value={k}>{NF_STATUS_LABELS_MAP[k]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Data de Pagamento</label>
                  <input type="date" value={form.dataPagamento} onChange={e => setForm(f => ({ ...f, dataPagamento: e.target.value }))} className="input-premium" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#6b7280' }}>Observação</label>
                  <input value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} className="input-premium" placeholder="Observações..." />
                </div>
              </div>

              {/* Arquivos já salvos */}
              {form.arquivos.length > 0 && (
                <div>
                  <label className="block text-[11px] font-medium mb-2" style={{ color: '#6b7280' }}>Arquivos salvos</label>
                  <div className="flex flex-wrap gap-2">
                    {form.arquivos.map((url, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]"
                        style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Arquivo {i + 1}</a>
                        <button onClick={() => removeArquivo(url)} className="ml-1" style={{ color: '#dc2626' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload novos arquivos */}
              <div>
                <label className="block text-[11px] font-medium mb-2" style={{ color: '#6b7280' }}>
                  Adicionar arquivos <span style={{ color: '#9ca3af' }}>(pode selecionar vários de uma vez)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border border-dashed transition-colors"
                  style={{ borderColor: files.length > 0 ? '#2563eb' : 'rgba(0,0,0,0.15)', background: files.length > 0 ? 'rgba(37,99,235,0.04)' : 'transparent' }}>
                  <Upload className="w-4 h-4 flex-shrink-0" style={{ color: files.length > 0 ? '#2563eb' : '#9ca3af' }} />
                  <span className="text-[12px]" style={{ color: files.length > 0 ? '#2563eb' : '#9ca3af' }}>
                    {files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : 'Clique para selecionar PDF, XML, imagem... (múltiplos permitidos)'}
                  </span>
                  <input type="file" className="hidden" accept=".pdf,.xml,.jpg,.jpeg,.png,.webp" multiple
                    onChange={e => setFiles(Array.from(e.target.files ?? []))} />
                </label>
                {files.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {files.map((f, i) => (
                      <li key={i} className="text-[11px] flex items-center gap-1" style={{ color: '#6b7280' }}>
                        <FileText className="w-3 h-3" /> {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <button onClick={() => setModal({ open: false, editing: null })} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={uploading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : modal.editing ? 'Salvar Alterações' : 'Cadastrar NF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────
export default function EmpenhosPage() {
  const { empenhos, addEmpenho, updateEmpenho, deleteEmpenho, updateNFStatus, loadFromDB } = useDemoStore();
  const [tab, setTab] = useState<'empenhos' | 'notas'>('empenhos');
  const [filter, setFilter] = useState<EmpenhoStatus | 'TODOS'>('TODOS');
  const [mesFiltro, setMesFiltro] = useState<string>('TODOS');
  const [modal, setModal] = useState<{ open: boolean; editing: Empenho | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Empenho, 'id' | 'createdAt'>>(emptyForm);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [nfExpanded, setNfExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  // Meses disponíveis a partir das datas dos empenhos
  const mesesDisponiveis = Array.from(new Set(
    empenhos.map(e => e.createdAt?.slice(0, 7)).filter(Boolean)
  )).sort((a, b) => b.localeCompare(a));

  const filtered = empenhos.filter(e => {
    const statusOk = filter === 'TODOS' || e.status === filter;
    const mesOk = mesFiltro === 'TODOS' || e.createdAt?.startsWith(mesFiltro);
    return statusOk && mesOk;
  });
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
    const hoje = new Date().toLocaleDateString('pt-BR');
    const fmtStatus: Record<string, string> = {
      PENDENTE: 'Pendente', EM_ENTREGA: 'Em Entrega',
      ENTREGA_PARCIAL: 'Entrega Parcial', ENTREGA_TOTAL: 'Entrega Total', CANCELADO: 'Cancelado',
    };
    const fmtNfStatus: Record<string, string> = {
      AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
      PAGAMENTO_EFETUADO: 'Pagamento Efetuado',
      NOTA_CANCELADA: 'Nota Cancelada',
    };
    const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fmtDate = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '';

    const lines: string[] = [];
    const cell = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const row = (...cols: (string | number)[]) => lines.push(cols.map(cell).join(';'));

    // ── Cabeçalho do relatório ──────────────────────────────────
    row('IMPACTA EMPREENDIMENTOS', '', '', '', '', '', '', '', '', '', '', '', '', '');
    row('Relatório de Empenhos', '', '', '', '', '', '', '', '', '', '', '', '', '');
    row(`Emitido em: ${hoje}`, '', '', '', '', '', '', '', '', '', '', '', '', '');
    row(`Filtro: ${filter === 'TODOS' ? 'Todos os empenhos' : fmtStatus[filter]}`, '', '', '', '', '', '', '', '', '', '', '', '', '');
    row('');

    // ── Totais gerais ──────────────────────────────────────────
    row('RESUMO GERAL', '', '', '', '', '', '', '', '', '', '', '', '', '');
    row('Total de Empenhos', filtered.length, '', '', '', '', '', '', '', '', '', '', '', '');
    row('Valor Total de Venda', fmtBRL(allTv), '', '', '', '', '', '', '', '', '', '', '', '');
    row('Total Custo (entregue)', fmtBRL(allTc), '', '', '', '', '', '', '', '', '', '', '', '');
    row('');

    // ── Colunas da tabela ──────────────────────────────────────
    row(
      'Nº Empenho', 'Fornecedor', 'Órgão', 'Status Empenho',
      'Resp. Compra', 'Resp. Entrega', 'Data Criação',
      'Item #', 'Descrição do Item', 'Unidade', 'Marca',
      'Qtd Pedida', 'Vlr Unitário Venda', 'Total Venda',
      'Qtd Entregue', 'Falta Entregar',
      'Vlr Unitário Custo', 'Total Custo',
      'Nota Fiscal', 'Valor NF', 'Data Entrega NF',
      'Status NF', 'Data Pagamento NF',
    );

    // ── Linhas por empenho / item ──────────────────────────────
    filtered.forEach(e => {
      const tv = e.itens.reduce((s, i) => s + i.qtd * i.valorVenda, 0);
      const tc = e.itens.reduce((s, i) => s + i.qtdEntregue * i.valorCusto, 0);

      e.itens.forEach((it, idx) => {
        row(
          e.numero,
          e.fornecedor,
          e.orgao,
          fmtStatus[e.status] ?? e.status,
          e.responsavelCompra,
          e.responsavelEntrega,
          fmtDate(e.createdAt),
          idx + 1,
          it.descricao,
          it.und,
          it.marca,
          it.qtd,
          fmtBRL(it.valorVenda),
          fmtBRL(it.qtd * it.valorVenda),
          it.qtdEntregue,
          it.qtd - it.qtdEntregue,
          fmtBRL(it.valorCusto),
          fmtBRL(it.qtdEntregue * it.valorCusto),
          it.nf,
          it.valorNf ? fmtBRL(it.valorNf) : '',
          fmtDate(it.dataEntregaNf),
          fmtNfStatus[it.nfStatus] ?? '',
          fmtDate(it.nfDataPagamento),
        );
      });

      // Subtotal por empenho
      row(
        '', `SUBTOTAL — ${e.numero}`, '', '', '', '', '',
        `${e.itens.length} itens`, '', '', '',
        e.itens.reduce((s, i) => s + i.qtd, 0), '', fmtBRL(tv),
        e.itens.reduce((s, i) => s + i.qtdEntregue, 0),
        e.itens.reduce((s, i) => s + (i.qtd - i.qtdEntregue), 0),
        '', fmtBRL(tc),
        '', '', '', '', '',
      );
      row('');
    });

    // ── Rodapé ─────────────────────────────────────────────────
    row('');
    row('TOTAL GERAL', '', '', '', '', '', '', '', '', '', '', '', '', fmtBRL(allTv), '', '', '', fmtBRL(allTc), '', '', '', '', '');

    const csv = lines.join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Impacta-Empenhos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro de status */}
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

            {/* Filtro de mês */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>Mês:</span>
              <select
                value={mesFiltro}
                onChange={e => setMesFiltro(e.target.value)}
                className="input-premium text-[12px] py-1.5"
                style={{ minWidth: 150 }}>
                <option value="TODOS">Todos os meses</option>
                {mesesDisponiveis.map(m => {
                  const [ano, mes] = m.split('-');
                  const nomeMes = new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                  return <option key={m} value={m}>{nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</option>;
                })}
              </select>
              {mesFiltro !== 'TODOS' && (
                <button onClick={() => setMesFiltro('TODOS')} className="text-[11px] px-2 py-1 rounded-lg transition-colors"
                  style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)' }}>
                  Limpar
                </button>
              )}
            </div>
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
        <NotasFiscaisTab />
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
