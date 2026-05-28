import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  totpCode: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter ao menos 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter ao menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[0-9]/, 'Deve conter número'),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmNewPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Senha deve ter ao menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[0-9]/, 'Deve conter número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

// ─── Licitation ──────────────────────────────────────────────────────────────

export const createLicitationSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  organ: z.string().min(2, 'Órgão é obrigatório'),
  modality: z.enum([
    'PREGAO_ELETRONICO',
    'PREGAO_PRESENCIAL',
    'CONCORRENCIA',
    'TOMADA_DE_PRECOS',
    'CONVITE',
    'CONCURSO',
    'LEILAO',
    'DIALOGO_COMPETITIVO',
    'DISPENSA',
    'INEXIGIBILIDADE',
    'RDC',
  ]),
  status: z
    .enum([
      'PROSPECTING',
      'ANALYZING',
      'IN_PROGRESS',
      'SUBMITTED',
      'WON',
      'LOST',
      'CANCELLED',
      'SUSPENDED',
    ])
    .optional(),
  estimatedValue: z.number().positive('Valor deve ser positivo').optional(),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
  description: z.string().optional(),
  editalUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  category: z.string().optional(),
  assignedToId: z.string().optional(),
});

// ─── Contract ────────────────────────────────────────────────────────────────

export const createContractSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  clientName: z.string().min(2, 'Cliente é obrigatório'),
  clientCnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)')
    .optional()
    .or(z.literal('')),
  value: z.number().positive('Valor deve ser positivo'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  description: z.string().optional(),
  licitationId: z.string().optional(),
  assignedToId: z.string().optional(),
});

// ─── Proposal ────────────────────────────────────────────────────────────────

export const createProposalSchema = z.object({
  licitationId: z.string().min(1, 'Licitação é obrigatória'),
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  value: z.number().positive('Valor deve ser positivo'),
  description: z.string().optional(),
  technicalScore: z.number().min(0).max(100).optional(),
  competitorCount: z.number().min(0).optional(),
  assignedToId: z.string().optional(),
});

// ─── Financial ───────────────────────────────────────────────────────────────

export const createFinancialSchema = z.object({
  type: z.enum(['REVENUE', 'EXPENSE']),
  category: z.enum([
    'CONTRACT_PAYMENT',
    'PROPOSAL_FEE',
    'CONSULTING',
    'OPERATIONAL',
    'PERSONNEL',
    'TAXES',
    'TRAVEL',
    'EQUIPMENT',
    'SOFTWARE',
    'OTHER',
  ]),
  description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  contractId: z.string().optional(),
  licitationId: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Task ─────────────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional(),
  licitationId: z.string().optional(),
  contractId: z.string().optional(),
  assignedToId: z.string().optional(),
});

// ─── CRM ─────────────────────────────────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  source: z.string().optional(),
  value: z.number().positive('Valor deve ser positivo').optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyId: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateLicitationFormData = z.infer<typeof createLicitationSchema>;
export type CreateContractFormData = z.infer<typeof createContractSchema>;
export type CreateProposalFormData = z.infer<typeof createProposalSchema>;
export type CreateFinancialFormData = z.infer<typeof createFinancialSchema>;
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;
export type CreateContactFormData = z.infer<typeof createContactSchema>;
