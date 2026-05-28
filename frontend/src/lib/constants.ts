export const LICITATION_STATUS_LABELS: Record<string, string> = {
  PROSPECTING: 'Prospecção',
  ANALYZING: 'Em Análise',
  IN_PROGRESS: 'Em Andamento',
  SUBMITTED: 'Submetida',
  WON: 'Ganha',
  LOST: 'Perdida',
  CANCELLED: 'Cancelada',
  SUSPENDED: 'Suspensa',
};

export const LICITATION_STATUS_COLORS: Record<string, string> = {
  PROSPECTING: 'bg-slate-500/20 text-slate-300',
  ANALYZING: 'bg-yellow-500/20 text-yellow-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  SUBMITTED: 'bg-purple-500/20 text-purple-300',
  WON: 'bg-emerald-500/20 text-emerald-300',
  LOST: 'bg-red-500/20 text-red-300',
  CANCELLED: 'bg-red-900/20 text-red-400',
  SUSPENDED: 'bg-orange-500/20 text-orange-300',
};

export const MODALITY_LABELS: Record<string, string> = {
  PREGAO_ELETRONICO: 'Pregão Eletrônico',
  PREGAO_PRESENCIAL: 'Pregão Presencial',
  CONCORRENCIA: 'Concorrência',
  TOMADA_DE_PRECOS: 'Tomada de Preços',
  CONVITE: 'Convite',
  CONCURSO: 'Concurso',
  LEILAO: 'Leilão',
  DIALOGO_COMPETITIVO: 'Diálogo Competitivo',
  DISPENSA: 'Dispensa',
  INEXIGIBILIDADE: 'Inexigibilidade',
  RDC: 'RDC',
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Proposta',
  NEGOTIATION: 'Negociação',
  WON: 'Ganho',
  LOST: 'Perdido',
  INACTIVE: 'Inativo',
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-slate-500/20 text-slate-300',
  CONTACTED: 'bg-blue-500/20 text-blue-300',
  QUALIFIED: 'bg-yellow-500/20 text-yellow-300',
  PROPOSAL: 'bg-purple-500/20 text-purple-300',
  NEGOTIATION: 'bg-orange-500/20 text-orange-300',
  WON: 'bg-emerald-500/20 text-emerald-300',
  LOST: 'bg-red-500/20 text-red-300',
  INACTIVE: 'bg-slate-700/20 text-slate-400',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Andamento',
  IN_REVIEW: 'Em Revisão',
  REVIEW: 'Em Revisão',
  DONE: 'Concluída',
  CANCELLED: 'Cancelada',
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-slate-500/20 text-slate-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  IN_REVIEW: 'bg-yellow-500/20 text-yellow-300',
  REVIEW: 'bg-yellow-500/20 text-yellow-300',
  DONE: 'bg-emerald-500/20 text-emerald-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  ANALYST: 'Analista',
  VIEWER: 'Visualizador',
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
