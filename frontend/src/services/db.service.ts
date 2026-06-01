import { supabase } from '@/lib/supabase';
import type { Empenho, EmpenhoItem, Licitacao, NotaFiscal } from '@/store/demoStore';

// ─── Mappers: camelCase ↔ snake_case ────────────────────────────

function empenhoToRow(e: Empenho) {
  return {
    id: e.id,
    numero: e.numero,
    fornecedor: e.fornecedor,
    orgao: e.orgao,
    itens: e.itens,
    status: e.status,
    responsavel_compra: e.responsavelCompra,
    responsavel_entrega: e.responsavelEntrega,
    observacao: e.observacao,
    created_at: e.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEmpenho(r: any): Empenho {
  return {
    id: r.id,
    numero: r.numero,
    fornecedor: r.fornecedor || '',
    orgao: r.orgao || '',
    itens: (r.itens || []).map((it: EmpenhoItem) => ({
      nf: '', valorNf: 0, dataEntregaNf: '',
      ...it,
    })),
    status: r.status,
    responsavelCompra: r.responsavel_compra || '',
    responsavelEntrega: r.responsavel_entrega || '',
    observacao: r.observacao || '',
    createdAt: r.created_at,
  };
}

function licitacaoToRow(l: Licitacao) {
  return {
    id: l.id,
    numero: l.numero,
    objeto: l.objeto,
    orgao: l.orgao,
    modalidade: l.modalidade,
    valor_estimado: l.valorEstimado,
    data_abertura: l.dataAbertura || null,
    status: l.status,
    edital: l.edital,
    responsavel: l.responsavel,
    observacao: l.observacao,
    created_at: l.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToLicitacao(r: any): Licitacao {
  return {
    id: r.id,
    numero: r.numero,
    objeto: r.objeto,
    orgao: r.orgao || '',
    modalidade: r.modalidade,
    valorEstimado: Number(r.valor_estimado),
    dataAbertura: r.data_abertura || '',
    status: r.status,
    edital: r.edital || '',
    responsavel: r.responsavel || '',
    observacao: r.observacao || '',
    createdAt: r.created_at,
  };
}

// ─── Empenhos ──────────────────────────────────────────────────

export const dbEmpenhos = {
  async getAll(): Promise<Empenho[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('empenhos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('[db] getAll empenhos:', error.message); return null; }
    return data.map(rowToEmpenho);
  },

  async upsert(empenho: Empenho): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('empenhos')
      .upsert(empenhoToRow(empenho), { onConflict: 'id' });
    if (error) console.error('[db] upsert empenho:', error.message);
  },

  async delete(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('empenhos').delete().eq('id', id);
    if (error) console.error('[db] delete empenho:', error.message);
  },
};

// ─── Licitações ─────────────────────────────────────────────────

export const dbLicitacoes = {
  async getAll(): Promise<Licitacao[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('licitacoes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('[db] getAll licitacoes:', error.message); return null; }
    return data.map(rowToLicitacao);
  },

  async upsert(licitacao: Licitacao): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('licitacoes')
      .upsert(licitacaoToRow(licitacao), { onConflict: 'id' });
    if (error) console.error('[db] upsert licitacao:', error.message);
  },

  async delete(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('licitacoes').delete().eq('id', id);
    if (error) console.error('[db] delete licitacao:', error.message);
  },
};

// ─── Notas Fiscais (independentes) ──────────────────────────────

function nfToRow(nf: NotaFiscal) {
  return {
    id: nf.id,
    numero_nf: nf.numeroNf,
    numero_empenho: nf.numeroEmpenho,
    fornecedor: nf.fornecedor,
    orgao: nf.orgao,
    valor: nf.valor,
    data_entrega: nf.dataEntrega || null,
    status: nf.status,
    data_pagamento: nf.dataPagamento || null,
    arquivos: nf.arquivos,
    observacao: nf.observacao,
    created_at: nf.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToNf(r: any): NotaFiscal {
  return {
    id: r.id,
    numeroNf: r.numero_nf || '',
    numeroEmpenho: r.numero_empenho || '',
    fornecedor: r.fornecedor || '',
    orgao: r.orgao || '',
    valor: Number(r.valor) || 0,
    dataEntrega: r.data_entrega || '',
    status: r.status || 'AGUARDANDO_PAGAMENTO',
    dataPagamento: r.data_pagamento || '',
    arquivos: Array.isArray(r.arquivos) ? r.arquivos : [],
    observacao: r.observacao || '',
    createdAt: r.created_at || '',
  };
}

export const dbNotasFiscais = {
  async getAll(): Promise<NotaFiscal[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('[db] getAll notas_fiscais:', error.message); return null; }
    return data.map(rowToNf);
  },

  async upsert(nf: NotaFiscal): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('notas_fiscais')
      .upsert(nfToRow(nf), { onConflict: 'id' });
    if (error) console.error('[db] upsert nota_fiscal:', error.message);
  },

  async delete(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('notas_fiscais').delete().eq('id', id);
    if (error) console.error('[db] delete nota_fiscal:', error.message);
  },
};

// ─── Storage: NF Files ──────────────────────────────────────────

export const dbStorage = {
  async uploadNfFile(file: File): Promise<string | null> {
    if (!supabase) return null;
    const ext = file.name.split('.').pop();
    const path = `nf-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('nf-docs').upload(path, file, { upsert: true });
    if (error) { console.error('[storage] upload:', error.message); return null; }
    const { data } = supabase.storage.from('nf-docs').getPublicUrl(path);
    return data.publicUrl;
  },

  async deleteNfFile(url: string): Promise<void> {
    if (!supabase) return;
    const path = url.split('/nf-docs/').pop();
    if (!path) return;
    await supabase.storage.from('nf-docs').remove([path]);
  },
};
