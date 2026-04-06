# IWR Moda - Sistema de Gestão

## Estrutura

```
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + Prisma
├── docker-compose.yml # Frontend + Backend + PostgreSQL
├── .env.example       # Variáveis de ambiente
└── txt.txt            # Diretriz de engenharia
```

## Requisitos

- Docker + Docker Compose
- Nada mais

## Subir ambiente local

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Subir tudo
docker compose up -d

# 3. Aguardar ~30s e verificar status
docker compose ps
```

O sistema estará disponível em:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## Credenciais padrão

- **Admin:** admin@iwr.com / admin@123

## Serviços

| Serviço    | Container     | URL                  | Descrição              |
|------------|--------------|----------------------|------------------------|
| Frontend   | iwr-frontend | http://localhost:3000 | interface React        |
| Backend    | iwr-backend  | http://localhost:3001 | API Express            |
| PostgreSQL | iwr-db       | localhost:5432       | Banco de dados         |

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login com email/senha
- `GET /api/auth/me` - Obter usuário logado

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Criar cliente (nome + cpf obrigatórios, CPF único)
- `GET /api/customers/search?q=` - Buscar por nome, CPF ou telefone

### Vendas
- `POST /api/sales` - Criar venda com itens (gera título automaticamente)
- `GET /api/sales` - Listar vendas

### Títulos
- `GET /api/promissory-notes` - Listar títulos com filtros
- `PATCH /api/promissory-notes/:id/pay` - Baixar como pago
- `PATCH /api/promissory-notes/:id/mark-whatsapp` - Marcar WhatsApp enviado

### Dashboard
- `GET /api/dashboard` - Métricas para painel

## Sprint Completas

### Sprint 1 ✅ - Modo demo removido, base real
- Autenticação JWT real
- Backend Express + Prisma + PostgreSQL
- Docker Compose containerizado
- API de clientes (CRUD, CPF único, busca por nome/CPF/telefone)
- API de vendas com geração automática de títulos
- API de carteira de títulos com baixa de pagamento
- Dashboard com dados reais do banco
- Frontend integrado via API (sem localStorage)
- React Router para navegação real
- WhatsApp com saneamento correto de telefone
- Bug fix: busca por CPF e telefone
- Bug fix: data filter na carteira
- Bug fix: logout funcional

### Pendente Sprint 2
- Edição de cliente
- Validações completas
- Logs de ações críticas
- Impressão formatada da nota promissória
- Mensagens de erro e sucesso

## Diretriz de Engenharia

Ver `txt.txt`
