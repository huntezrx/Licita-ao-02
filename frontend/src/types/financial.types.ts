export type FinancialType = 'REVENUE' | 'EXPENSE';

export type FinancialCategory =
  | 'CONTRACT_PAYMENT'
  | 'PROPOSAL_FEE'
  | 'CONSULTING'
  | 'OPERATIONAL'
  | 'PERSONNEL'
  | 'TAXES'
  | 'TRAVEL'
  | 'EQUIPMENT'
  | 'SOFTWARE'
  | 'OTHER';

export interface Financial {
  id: string;
  type: FinancialType;
  category: FinancialCategory;
  description: string;
  amount: number;
  date: string;
  contractId: string | null;
  licitationId: string | null;
  tags: string[];
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinancialDto {
  type: FinancialType;
  category: FinancialCategory;
  description: string;
  amount: number;
  date: string;
  contractId?: string;
  licitationId?: string;
  tags?: string[];
  notes?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueThisMonth: number;
  expensesThisMonth: number;
}

export interface CashFlowPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinancialFilter {
  type?: FinancialType;
  category?: FinancialCategory;
  startDate?: string;
  endDate?: string;
  contractId?: string;
  licitationId?: string;
  page?: number;
  limit?: number;
}
