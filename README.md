# Sistema de Gestão de Licitações

Sistema enterprise completo para gestão de licitações públicas, contratos, propostas e relacionamento comercial.

## Tecnologias

**Frontend:** Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Zustand, React Query, Recharts

**Backend:** NestJS, Prisma ORM, PostgreSQL, Redis, BullMQ, Socket.io

**Infraestrutura:** Docker, Docker Compose, AWS S3, GitHub Actions

**Autenticação:** JWT + Refresh Token, RBAC, 2FA (TOTP)

**IA:** OpenAI GPT-4 para análise de editais, riscos e geração de propostas

## Funcionalidades

- Gestão completa de licitações (PNCP, ComprasNet)
- Pipeline CRM com kanban
- Gestão de contratos e propostas
- Módulo financeiro com fluxo de caixa
- Assistente IA para análise de editais
- Notificações em tempo real (WebSocket)
- Crawler automático de editais
- Relatórios e dashboards
- Auditoria e logs de segurança
- Autenticação 2FA

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker e Docker Compose (opcional)

## Setup Rápido com Docker

```bash
# Clone e configure variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie os serviços de desenvolvimento
docker compose -f docker-compose.dev.yml up -d

# Configure o banco de dados
cd backend
npm install
npx prisma migrate dev
npx prisma generate

# Inicie o backend
npm run start:dev

# Em outro terminal, inicie o frontend
cd frontend
npm install
npm run dev
```

## Desenvolvimento sem Docker

```bash
# Backend
cd backend
npm install
cp ../.env.example .env  # editar conforme necessário
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

## Acessos

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger Docs: http://localhost:3001/api/docs
- Adminer (BD): http://localhost:8080

## Estrutura do Projeto

```
Licita-ao-02/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/     # Módulos da aplicação
│   │   ├── common/      # Filtros, interceptors, guards
│   │   ├── config/      # Configurações
│   │   └── prisma/      # Serviço e schema Prisma
│   └── Dockerfile
├── frontend/             # Next.js 15
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # Componentes React
│   │   ├── services/    # Camada de API
│   │   ├── store/       # Zustand stores
│   │   ├── hooks/       # Custom hooks
│   │   └── types/       # TypeScript types
│   └── Dockerfile
├── docker/               # Configurações Docker
│   └── nginx/
├── .github/workflows/    # CI/CD
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Módulos do Backend

| Módulo | Descrição |
|--------|-----------|
| auth | Autenticação JWT, 2FA, refresh tokens |
| users | Gestão de usuários e perfis |
| licitations | Core de licitações |
| notices | Editais coletados automaticamente |
| contracts | Contratos e aditivos |
| proposals | Propostas comerciais |
| documents | Gestão de documentos (AWS S3) |
| financial | Módulo financeiro |
| notifications | Notificações em tempo real |
| ai | Assistente IA (OpenAI) |
| crm | CRM - Leads, Contatos, Empresas |
| tasks | Gestão de tarefas |
| crawler | Crawlers PNCP e ComprasNet |
| dashboard | KPIs e métricas |
| reports | Relatórios e exportações |
| admin | Administração do sistema |

## Variáveis de Ambiente Importantes

Veja o arquivo `.env.example` para todas as variáveis necessárias.

Variáveis críticas para produção:
- `JWT_SECRET` - Chave secreta para tokens JWT (mín. 32 chars)
- `JWT_REFRESH_SECRET` - Chave para refresh tokens
- `OPENAI_API_KEY` - API key do OpenAI (funcionalidades de IA)
- `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` - Para upload de documentos
- `DATABASE_URL` - String de conexão do PostgreSQL

## Deploy em Produção

```bash
# Configure todas as variáveis de ambiente no .env
cp .env.example .env
vi .env

# Suba todos os serviços
docker compose up -d

# Execute as migrations
docker exec licitacao_backend npx prisma migrate deploy
```

## CI/CD

O projeto usa GitHub Actions para:
- Linting e type-checking em todo PR
- Testes automatizados
- Build das imagens Docker
- Deploy automático na branch main

Configure os seguintes secrets no GitHub:
- `DEPLOY_HOST` - IP/hostname do servidor
- `DEPLOY_USER` - Usuário SSH
- `DEPLOY_SSH_KEY` - Chave privada SSH
- `SLACK_WEBHOOK` - (opcional) Notificações de deploy
