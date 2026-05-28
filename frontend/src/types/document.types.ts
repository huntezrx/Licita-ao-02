export type DocumentCategory =
  | 'EDITAL'
  | 'PROPOSTA'
  | 'CONTRATO'
  | 'ADITIVO'
  | 'NOTA_FISCAL'
  | 'CERTIDAO'
  | 'RELATORIO'
  | 'ATA'
  | 'OUTROS';

export interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  s3Key: string;
  downloadUrl: string | null;
  licitationId: string | null;
  contractId: string | null;
  proposalId: string | null;
  tags: string[];
  notes: string | null;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilter {
  category?: DocumentCategory;
  licitationId?: string;
  contractId?: string;
  proposalId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DocumentUploadResult {
  document: Document;
  uploadUrl?: string;
}
