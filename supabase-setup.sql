-- Run this SQL in your Supabase project: SQL Editor → New Query

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Empenhos table
create table if not exists public.empenhos (
  id text primary key,
  numero text not null,
  fornecedor text default '',
  orgao text default '',
  itens jsonb default '[]',
  status text default 'PENDENTE',
  responsavel_compra text default '',
  responsavel_entrega text default '',
  observacao text default '',
  created_at text default ''
);

-- Licitacoes table
create table if not exists public.licitacoes (
  id text primary key,
  numero text not null,
  objeto text default '',
  orgao text default '',
  modalidade text default 'PREGAO_ELETRONICO',
  valor_estimado numeric default 0,
  data_abertura text default '',
  status text default 'ABERTA',
  edital text default '',
  responsavel text default '',
  observacao text default '',
  created_at text default ''
);

-- Storage bucket for NF files
insert into storage.buckets (id, name, public)
values ('nf-docs', 'nf-docs', true)
on conflict do nothing;

-- RLS: disable for simplicity (single-user system)
alter table public.empenhos disable row level security;
alter table public.licitacoes disable row level security;

-- Storage policy: allow all operations
create policy "allow all on nf-docs" on storage.objects
  for all using (bucket_id = 'nf-docs') with check (bucket_id = 'nf-docs');

-- Notas Fiscais independentes (rodar se ainda não criou)
create table if not exists public.notas_fiscais (
  id text primary key,
  numero_nf text not null,
  numero_empenho text default '',
  fornecedor text default '',
  orgao text default '',
  valor numeric default 0,
  data_entrega text default null,
  status text default 'AGUARDANDO_PAGAMENTO',
  data_pagamento text default null,
  arquivos jsonb default '[]',
  observacao text default '',
  created_at text default ''
);
alter table public.notas_fiscais disable row level security;
