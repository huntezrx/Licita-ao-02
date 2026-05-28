'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dbEmpenhos, dbLicitacoes } from '@/services/db.service';

export type EmpenhoStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO';
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

const initialEmpenhos: Empenho[] = [
  {
    id: '1', numero: '2026NE000395', fornecedor: 'IMPACTA EMPREENDIMENTOS LTDA', orgao: 'Comando da Aeronáutica - BABV',
    itens: [
      { id: '1-1', descricao: 'Açúcar Cristal Orgânico Pacote 1kg', und: 'UN', marca: '', qtd: 450, valorVenda: 4.00, qtdEntregue: 450, valorCusto: 3.20, nf: 'NF-001234', valorNf: 1800.00, dataEntregaNf: '2024-03-15' },
      { id: '1-2', descricao: 'Arroz Beneficiado Agulhinha Polido Tipo 1', und: 'UN', marca: '', qtd: 750, valorVenda: 4.85, qtdEntregue: 750, valorCusto: 3.90, nf: 'NF-001234', valorNf: 3637.50, dataEntregaNf: '2024-03-15' },
      { id: '1-3', descricao: 'Farinha de Mandioca Amarela Fina Tipo 1', und: 'UN', marca: '', qtd: 91, valorVenda: 4.20, qtdEntregue: 91, valorCusto: 3.50, nf: 'NF-001234', valorNf: 382.20, dataEntregaNf: '2024-03-15' },
      { id: '1-4', descricao: 'Feijão Carioca Tipo 1', und: 'UN', marca: '', qtd: 250, valorVenda: 5.80, qtdEntregue: 250, valorCusto: 4.60, nf: 'NF-001234', valorNf: 1450.00, dataEntregaNf: '2024-03-15' },
      { id: '1-5', descricao: 'Óleo Vegetal Soja Tipo 1 Embalagem 900ml', und: 'UN', marca: '', qtd: 120, valorVenda: 7.50, qtdEntregue: 120, valorCusto: 6.20, nf: 'NF-001234', valorNf: 900.00, dataEntregaNf: '2024-03-15' },
      { id: '1-6', descricao: 'Refrigerante Cola Embalagem 350ml', und: 'UN', marca: '', qtd: 100, valorVenda: 3.25, qtdEntregue: 100, valorCusto: 2.80, nf: 'NF-001234', valorNf: 325.00, dataEntregaNf: '2024-03-15' },
      { id: '1-7', descricao: 'Refrigerante Guaraná Embalagem 350ml', und: 'UN', marca: '', qtd: 100, valorVenda: 3.25, qtdEntregue: 100, valorCusto: 2.80, nf: 'NF-001234', valorNf: 325.00, dataEntregaNf: '2024-03-15' },
    ],
    status: 'PAGO',
    responsavelCompra: 'Carlos Silva', responsavelEntrega: 'Ana Souza',
    observacao: '', createdAt: '2024-03-01',
  },
  {
    id: '2', numero: '2024NE002', fornecedor: 'Dell Computadores do Brasil LTDA', orgao: 'Secretaria de Educação - SP',
    itens: [
      { id: '2-1', descricao: 'Notebook Dell Inspiron 15 i7 16GB RAM 512GB SSD', und: 'UN', marca: 'Dell', qtd: 5, valorVenda: 4500.00, qtdEntregue: 3, valorCusto: 3800.00, nf: '', valorNf: 0, dataEntregaNf: '' },
      { id: '2-2', descricao: 'Mouse sem fio Dell WM326', und: 'UN', marca: 'Dell', qtd: 5, valorVenda: 120.00, qtdEntregue: 3, valorCusto: 85.00, nf: '', valorNf: 0, dataEntregaNf: '' },
      { id: '2-3', descricao: 'Teclado Dell KB216 USB ABNT2', und: 'UN', marca: 'Dell', qtd: 5, valorVenda: 95.00, qtdEntregue: 3, valorCusto: 65.00, nf: '', valorNf: 0, dataEntregaNf: '' },
    ],
    status: 'PENDENTE',
    responsavelCompra: 'Pedro Costa', responsavelEntrega: 'Pedro Costa',
    observacao: 'Aguardando entrega das 2 unidades restantes', createdAt: '2024-03-05',
  },
  {
    id: '3', numero: '2024NE003', fornecedor: 'Flexform Móveis e Decorações LTDA', orgao: 'Prefeitura Municipal de Campinas',
    itens: [
      { id: '3-1', descricao: 'Cadeira Ergonômica Premium com apoio lombar', und: 'UN', marca: 'Flexform', qtd: 15, valorVenda: 850.00, qtdEntregue: 15, valorCusto: 920.00, nf: 'NF-001235', valorNf: 12750.00, dataEntregaNf: '2024-03-20' },
      { id: '3-2', descricao: 'Mesa de Escritório formato L 1,80m x 1,20m', und: 'UN', marca: 'Flexform', qtd: 5, valorVenda: 1200.00, qtdEntregue: 5, valorCusto: 980.00, nf: 'NF-001235', valorNf: 6000.00, dataEntregaNf: '2024-03-20' },
    ],
    status: 'PENDENTE',
    responsavelCompra: 'Maria Lima', responsavelEntrega: 'João Ferreira',
    observacao: 'ATENÇÃO: custo da cadeira acima do valor de venda', createdAt: '2024-03-08',
  },
  {
    id: '4', numero: '2024NE004', fornecedor: 'Distribuidora Papel Sul LTDA', orgao: 'TRT 2ª Região',
    itens: [
      { id: '4-1', descricao: 'Papel Sulfite A4 75g Resma 500 folhas', und: 'PCT', marca: 'Chamex', qtd: 500, valorVenda: 28.00, qtdEntregue: 500, valorCusto: 19.50, nf: 'NF-001236', valorNf: 14000.00, dataEntregaNf: '2024-03-10' },
      { id: '4-2', descricao: 'Caneta BIC Cristal Azul caixa 50 unidades', und: 'CX', marca: 'BIC', qtd: 50, valorVenda: 35.00, qtdEntregue: 50, valorCusto: 22.00, nf: 'NF-001237', valorNf: 1750.00, dataEntregaNf: '2024-03-10' },
      { id: '4-3', descricao: 'Grampeador Maped médio 26/6', und: 'UN', marca: 'Maped', qtd: 20, valorVenda: 45.00, qtdEntregue: 20, valorCusto: 32.00, nf: 'NF-001237', valorNf: 900.00, dataEntregaNf: '2024-03-10' },
      { id: '4-4', descricao: 'Clipes para papel 50mm caixa 100 unidades', und: 'CX', marca: 'Spiral', qtd: 100, valorVenda: 5.50, qtdEntregue: 100, valorCusto: 3.80, nf: 'NF-001237', valorNf: 550.00, dataEntregaNf: '2024-03-10' },
    ],
    status: 'PAGO',
    responsavelCompra: 'Carlos Silva', responsavelEntrega: 'Ana Souza',
    observacao: '', createdAt: '2024-03-10',
  },
];

const initialLicitacoes: Licitacao[] = [
  { id: '1', numero: 'PE-001/2024', objeto: 'Aquisição de Material de Escritório e Expediente', orgao: 'Prefeitura Municipal de São Paulo', modalidade: 'PREGAO_ELETRONICO', valorEstimado: 85000.00, dataAbertura: '2024-04-10', status: 'CONCLUIDA', edital: 'ED-001-2024.pdf', responsavel: 'Carlos Silva', observacao: 'Licitação encerrada com sucesso', createdAt: '2024-03-15' },
  { id: '2', numero: 'PE-002/2024', objeto: 'Fornecimento de Equipamentos de Informática', orgao: 'Secretaria de Educação - SP', modalidade: 'PREGAO_ELETRONICO', valorEstimado: 320000.00, dataAbertura: '2024-05-15', status: 'EM_ANDAMENTO', edital: 'ED-002-2024.pdf', responsavel: 'Pedro Costa', observacao: 'Em fase de lances', createdAt: '2024-04-01' },
  { id: '3', numero: 'CC-001/2024', objeto: 'Construção de Quadra Poliesportiva', orgao: 'Prefeitura Municipal de Campinas', modalidade: 'CONCORRENCIA', valorEstimado: 1200000.00, dataAbertura: '2024-06-20', status: 'ABERTA', edital: 'ED-003-2024.pdf', responsavel: 'Maria Lima', observacao: 'Prazo para envio de propostas até 15/06', createdAt: '2024-04-20' },
  { id: '4', numero: 'PE-003/2024', objeto: 'Serviços de Limpeza e Conservação Predial', orgao: 'TRT 2ª Região', modalidade: 'PREGAO_ELETRONICO', valorEstimado: 480000.00, dataAbertura: '2024-04-30', status: 'CONCLUIDA', edital: 'ED-004-2024.pdf', responsavel: 'Carlos Silva', observacao: 'Vencemos com valor de R$ 462.000,00', createdAt: '2024-04-05' },
  { id: '5', numero: 'TP-001/2024', objeto: 'Aquisição de Mobiliário para Escritório', orgao: 'DETRAN-SP', modalidade: 'TOMADA_PRECOS', valorEstimado: 95000.00, dataAbertura: '2024-05-08', status: 'SUSPENSA', edital: 'ED-005-2024.pdf', responsavel: 'Pedro Costa', observacao: 'Suspensa por decisão judicial', createdAt: '2024-04-12' },
  { id: '6', numero: 'PE-004/2024', objeto: 'Fornecimento de Gêneros Alimentícios', orgao: 'SEDF - Secretaria de Educação DF', modalidade: 'PREGAO_ELETRONICO', valorEstimado: 680000.00, dataAbertura: '2024-07-10', status: 'ABERTA', edital: 'ED-006-2024.pdf', responsavel: 'Maria Lima', observacao: '', createdAt: '2024-05-01' },
];

interface DemoStore {
  empenhos: Empenho[];
  licitacoes: Licitacao[];
  dbLoaded: boolean;
  addEmpenho: (e: Omit<Empenho, 'id' | 'createdAt'>) => void;
  updateEmpenho: (id: string, e: Partial<Empenho>) => void;
  deleteEmpenho: (id: string) => void;
  addLicitacao: (l: Omit<Licitacao, 'id' | 'createdAt'>) => void;
  updateLicitacao: (id: string, l: Partial<Licitacao>) => void;
  deleteLicitacao: (id: string) => void;
  loadFromDB: () => Promise<void>;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      empenhos: initialEmpenhos,
      licitacoes: initialLicitacoes,
      dbLoaded: false,

      loadFromDB: async () => {
        const [empenhos, licitacoes] = await Promise.all([
          dbEmpenhos.getAll(),
          dbLicitacoes.getAll(),
        ]);
        if (empenhos !== null && licitacoes !== null) {
          set({ empenhos, licitacoes, dbLoaded: true });
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
    }),
    {
      name: 'licitanex-data-v3',
      partialize: (s) => ({ empenhos: s.empenhos, licitacoes: s.licitacoes }),
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<typeof current>;
        const empenhos = (p.empenhos ?? current.empenhos).map((e: Empenho) => ({
          ...e,
          itens: Array.isArray(e.itens) ? e.itens.map(it => ({
            nf: '', valorNf: 0, dataEntregaNf: '',
            ...it,
          })) : [],
          fornecedor: e.fornecedor ?? '',
          orgao: e.orgao ?? '',
        }));
        return { ...current, ...p, empenhos };
      },
    }
  )
);
