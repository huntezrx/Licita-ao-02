'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dbEmpenhos, dbLicitacoes, dbNotasFiscais } from '@/services/db.service';

export type EmpenhoStatus = 'PENDENTE' | 'EM_ENTREGA' | 'ENTREGA_PARCIAL' | 'ENTREGA_TOTAL' | 'CANCELADO';
export type NfStatus = 'AGUARDANDO_PAGAMENTO' | 'PAGAMENTO_EFETUADO' | 'NOTA_CANCELADA';
export type LicitacaoStatus = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA' | 'SUSPENSA';
export type LicitacaoModalidade = 'PREGAO_ELETRONICO' | 'PREGAO_PRESENCIAL' | 'CONCORRENCIA' | 'TOMADA_PRECOS' | 'CONVITE' | 'DISPENSA';

export interface EmpenhoItem {
  id: string;
  descricao: string;
  und: string;
  marca: string;
  qtd: number;
  valorVenda: number;
  qtdEntregue: number;
  valorCusto: number;
  nf: string;
  valorNf: number;
  dataEntregaNf: string;
  nfStatus: NfStatus;
  nfDataPagamento: string;
  nfArquivo: string;
}

export interface Empenho {
  id: string;
  numero: string;
  fornecedor: string;
  orgao: string;
  itens: EmpenhoItem[];
  status: EmpenhoStatus;
  responsavelCompra: string;
  responsavelEntrega: string;
  observacao: string;
  createdAt: string;
}

export interface NotaFiscal {
  id: string;
  numeroNf: string;
  numeroEmpenho: string;
  fornecedor: string;
  orgao: string;
  valor: number;
  dataEntrega: string;
  status: NfStatus;
  dataPagamento: string;
  arquivos: string[];
  observacao: string;
  createdAt: string;
}

export interface Licitacao {
  id: string;
  numero: string;
  objeto: string;
  orgao: string;
  modalidade: LicitacaoModalidade;
  valorEstimado: number;
  dataAbertura: string;
  status: LicitacaoStatus;
  edital: string;
  responsavel: string;
  observacao: string;
  createdAt: string;
}

interface DemoStore {
  empenhos: Empenho[];
  licitacoes: Licitacao[];
  notasFiscais: NotaFiscal[];
  dbLoaded: boolean;
  addEmpenho: (e: Omit<Empenho, 'id' | 'createdAt'>) => void;
  updateEmpenho: (id: string, e: Partial<Empenho>) => void;
  deleteEmpenho: (id: string) => void;
  updateNFStatus: (empenhoId: string, nfNumero: string, updates: { nfStatus?: NfStatus; nfDataPagamento?: string; nfArquivo?: string }) => void;
  addLicitacao: (l: Omit<Licitacao, 'id' | 'createdAt'>) => void;
  updateLicitacao: (id: string, l: Partial<Licitacao>) => void;
  deleteLicitacao: (id: string) => void;
  addNotaFiscal: (nf: Omit<NotaFiscal, 'id' | 'createdAt'>) => void;
  updateNotaFiscal: (id: string, nf: Partial<NotaFiscal>) => void;
  deleteNotaFiscal: (id: string) => void;
  loadFromDB: () => Promise<void>;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      empenhos: [],
      licitacoes: [],
      notasFiscais: [],
      dbLoaded: false,

      loadFromDB: async () => {
        const [empenhos, licitacoes, notasFiscais] = await Promise.all([
          dbEmpenhos.getAll(),
          dbLicitacoes.getAll(),
          dbNotasFiscais.getAll(),
        ]);
        if (empenhos !== null && licitacoes !== null) {
          set({
            empenhos,
            licitacoes,
            notasFiscais: notasFiscais ?? [],
            dbLoaded: true,
          });
        }
      },

      addEmpenho: (e) => {
        const novo: Empenho = { ...e, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
        set((s) => ({ empenhos: [novo, ...s.empenhos] }));
        dbEmpenhos.upsert(novo);
      },

      updateEmpenho: (id, e) => {
        set((s) => ({ empenhos: s.empenhos.map((x) => x.id === id ? { ...x, ...e } : x) }));
        const updated = get().empenhos.find((x) => x.id === id);
        if (updated) dbEmpenhos.upsert(updated);
      },

      deleteEmpenho: (id) => {
        set((s) => ({ empenhos: s.empenhos.filter((x) => x.id !== id) }));
        dbEmpenhos.delete(id);
      },

      updateNFStatus: (empenhoId, nfNumero, updates) => {
        set((s) => ({
          empenhos: s.empenhos.map((e) => {
            if (e.id !== empenhoId) return e;
            return { ...e, itens: e.itens.map((it) => it.nf === nfNumero ? { ...it, ...updates } : it) };
          }),
        }));
        const updated = get().empenhos.find((x) => x.id === empenhoId);
        if (updated) dbEmpenhos.upsert(updated);
      },

      addLicitacao: (l) => {
        const nova: Licitacao = { ...l, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
        set((s) => ({ licitacoes: [nova, ...s.licitacoes] }));
        dbLicitacoes.upsert(nova);
      },

      updateLicitacao: (id, l) => {
        set((s) => ({ licitacoes: s.licitacoes.map((x) => x.id === id ? { ...x, ...l } : x) }));
        const updated = get().licitacoes.find((x) => x.id === id);
        if (updated) dbLicitacoes.upsert(updated);
      },

      deleteLicitacao: (id) => {
        set((s) => ({ licitacoes: s.licitacoes.filter((x) => x.id !== id) }));
        dbLicitacoes.delete(id);
      },

      addNotaFiscal: (nf) => {
        const nova: NotaFiscal = { ...nf, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
        set((s) => ({ notasFiscais: [nova, ...s.notasFiscais] }));
        dbNotasFiscais.upsert(nova);
      },

      updateNotaFiscal: (id, nf) => {
        set((s) => ({ notasFiscais: s.notasFiscais.map((x) => x.id === id ? { ...x, ...nf } : x) }));
        const updated = get().notasFiscais.find((x) => x.id === id);
        if (updated) dbNotasFiscais.upsert(updated);
      },

      deleteNotaFiscal: (id) => {
        set((s) => ({ notasFiscais: s.notasFiscais.filter((x) => x.id !== id) }));
        dbNotasFiscais.delete(id);
      },
    }),
    {
      name: 'licitanex-data-v4',
      partialize: (s) => ({ empenhos: s.empenhos, licitacoes: s.licitacoes, notasFiscais: s.notasFiscais }),
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<typeof current>;
        const empenhos = (p.empenhos ?? current.empenhos).map((e: Empenho) => ({
          ...e,
          itens: Array.isArray(e.itens) ? e.itens.map(it => ({
            nf: '', valorNf: 0, dataEntregaNf: '',
            nfStatus: 'AGUARDANDO_PAGAMENTO' as NfStatus,
            nfDataPagamento: '', nfArquivo: '',
            ...it,
          })) : [],
          fornecedor: e.fornecedor ?? '',
          orgao: e.orgao ?? '',
        }));
        return { ...current, ...p, empenhos, notasFiscais: p.notasFiscais ?? [] };
      },
    }
  )
);
