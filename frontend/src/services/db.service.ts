import { supabase } from '@/lib/supabase';
import type { Empenho, Licitacao } from '@/store/demoStore';

// ─── Mappers: camelCase ↔ snake_case ────────────────────────────

function empenhoToRow(e: Empenho) {
  return {
    id: e.id,
    numero: e.numero,
    item: e.item,
    und: e.und,
    marca: e.marca,
    qtd: e.qtd,
    valor_venda: e.valorVenda,
    qtd_entregue: e.qtdEntregue,
    valor_custo: e.valorCusto,
    status: e.status,
    nf: e.nf,
    valor_nf: e.valorNf,
    data_entrega_nf: e.dataEntregaNf || null,
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
    item: r.item,
    und: r.und || 'UN',
    marca: r.marca || '',
    qtd: Number(r.qtd),
    valorVenda: Number(r.valor_venda),
    qtdEntregue: Number(r.qtd_entregue),
    valorCusto: Number(r.valor_custo),
    status: r.status,
    nf: r.nf || '',
    valorNf: Number(r.valor_nf),
    dataEntregaNf: r.data_entrega_nf || '',
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
