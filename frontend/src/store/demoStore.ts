'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dbEmpenhos, dbLicitacoes } from '@/services/db.service';

export type EmpenhoStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO';
export type LicitacaoStatus = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA' | 'SUSPENSA';
export type LicitacaoModalidade = 'PREGAO_ELETRONICO' | 'PREGAO_PRESENCIAL' | 'CONCORRENCIA' | 'TOMADA_PRECOS' | 'CONVITE' | 'DISPENSA';

export interface Empenho {
  id: string;
  numero: string;
  item: string;
  und: string;
  marca: string;
  qtd: number;
  valorVenda: number;
  qtdEntregue: number;
  valorCusto: number;
  status: EmpenhoStatus;
  nf: string;
  valorNf: number;
  dataEntregaNf: string;
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
  { id: '1', numero: '2024NE001', item: 'Material de Escritório - Kit Completo', und: 'KIT', marca: 'Staples', qtd: 100, valorVenda: 125.00, qtdEntregue: 100, valorCusto: 89.00, status: 'PAGO', nf: 'NF-001234', valorNf: 12500.00, dataEntregaNf: '2024-03-15', responsavelCompra: 'Carlos Silva', responsavelEntrega: 'Ana Souza', observacao: 'Entregue conforme especificado', createdAt: '2024-03-01' },
  { id: '2', numero: '2024NE002', item: 'Notebook Dell Inspiron 15 i7', und: 'UN', marca: 'Dell', qtd: 5, valorVenda: 4500.00, qtdEntregue: 3, valorCusto: 3800.00, status: 'PENDENTE', nf: '', valorNf: 0, dataEntregaNf: '', responsavelCompra: 'Pedro Costa', responsavelEntrega: 'Pedro Costa', observacao: 'Aguardando entrega das 2 unidades restantes', createdAt: '2024-03-05' },
  { id: '3', numero: '2024NE003', item: 'Cadeiras Ergonômicas Premium', und: 'UN', marca: 'Flexform', qtd: 20, valorVenda: 850.00, qtdEntregue: 20, valorCusto: 920.00, status: 'PENDENTE', nf: 'NF-001235', valorNf: 18400.00, dataEntregaNf: '2024-03-20', responsavelCompra: 'Maria Lima', responsavelEntrega: 'João Ferreira', observacao: 'ATENÇÃO: custo acima do valor de venda', createdAt: '2024-03-08' },
  { id: '4', numero: '2024NE004', item: 'Papel Sulfite A4 75g - Resma 500fls', und: 'PCT', marca: 'Chamex', qtd: 500, valorVenda: 28.00, qtdEntregue: 500, valorCusto: 19.50, status: 'PAGO', nf: 'NF-001236', valorNf: 14000.00, dataEntregaNf: '2024-03-10', responsavelCompra: 'Carlos Silva', responsavelEntrega: 'Ana Souza', observacao: '', createdAt: '2024-03-10' },
  { id: '5', numero: '2024NE005', item: 'Canetas BIC Cristal Azul - Caixa', und: 'CX', marca: 'BIC', qtd: 50, valorVenda: 35.00, qtdEntregue: 0, valorCusto: 28.00, status: 'CANCELADO', nf: '', valorNf: 0, dataEntregaNf: '', responsavelCompra: 'Maria Lima', responsavelEntrega: '', observacao: 'Cancelado por falta de verba', createdAt: '2024-03-12' },
  { id: '6', numero: '2024NE006', item: 'Toner HP LaserJet Pro M404', und: 'UN', marca: 'HP', qtd: 30, valorVenda: 280.00, qtdEntregue: 30, valorCusto: 195.00, status: 'PAGO', nf: 'NF-001237', valorNf: 8400.00, dataEntregaNf: '2024-04-05', responsavelCompra: 'Pedro Costa', responsavelEntrega: 'João Ferreira', observacao: '', createdAt: '2024-04-01' },
  { id: '7', numero: '2024NE007', item: 'Monitor LED 24" Full HD LG', und: 'UN', marca: 'LG', qtd: 10, valorVenda: 1200.00, qtdEntregue: 6, valorCusto: 980.00, status: 'PENDENTE', nf: 'NF-001238', valorNf: 7200.00, dataEntregaNf: '2024-04-12', responsavelCompra: 'Carlos Silva', responsavelEntrega: 'Ana Souza', observacao: '4 monitores pendentes', createdAt: '2024-04-08' },
  { id: '8', numero: '2024NE008', item: 'Ar Condicionado Split 12000 BTUs Inverter', und: 'UN', marca: 'LG', qtd: 8, valorVenda: 3200.00, qtdEntregue: 8, valorCusto: 2650.00, status: 'PAGO', nf: 'NF-001239', valorNf: 25600.00, dataEntregaNf: '2024-04-20', responsavelCompra: 'Maria Lima', responsavelEntrega: 'João Ferreira', observacao: 'Instalação inclusa', createdAt: '2024-04-15' },
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
  // CRUD
  addEmpenho: (e: Omit<Empenho, 'id' | 'createdAt'>) => void;
  updateEmpenho: (id: string, e: Partial<Empenho>) => void;
  deleteEmpenho: (id: string) => void;
  addLicitacao: (l: Omit<Licitacao, 'id' | 'createdAt'>) => void;
  updateLicitacao: (id: string, l: Partial<Licitacao>) => void;
  deleteLicitacao: (id: string) => void;
  // Supabase sync
  loadFromDB: () => Promise<void>;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      empenhos: initialEmpenhos,
      licitacoes: initialLicitacoes,
      dbLoaded: false,

      loadFromDB: async () => {
        if (get().dbLoaded) return;
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
      name: 'demo-data-store',
      partialize: (s) => ({ empenhos: s.empenhos, licitacoes: s.licitacoes }),
    }
  )
);
