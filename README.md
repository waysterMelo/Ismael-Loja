# IWR Moda - Sistema de Gestão

## Estrutura

```
├── frontend/          # React + TypeScript + Vite + Nginx (produção)
├── backend/           # Node.js + Express + Prisma
├── infra/             # Scripts de backup e restore
├── docker-compose.yml # Frontend + Backend + PostgreSQL
├── .env.example       # Variáveis de ambiente
└── README.md          # Este arquivo
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
- **Health Check:** http://localhost:3001/api/health

## Credenciais padrão

- **Admin:** admin@iwr.com / admin@123
- **Operador:** operador@iwr.com / operador@123

## Permissões por Perfil

| Funcionalidade | ADMIN | OPERATOR |
|---|---|---|
| Listar clientes | ✅ | ✅ |
| Criar cliente | ✅ | ❌ |
| Editar cliente | ✅ | ❌ |
| Criar venda | ✅ | ✅ |
| Listar vendas | ✅ | ❌ |
| Ver venda (detalhes) | ✅ | ✅ |
| Listar títulos | ✅ | ✅ |
| Ver título (detalhes) | ✅ | ✅ |
| Baixar título | ✅ | ✅ |
| Dashboard | ✅ | ❌ |
| Auditoria | ✅ | ❌ |

## Serviços

| Serviço    | Container     | URL                  | Descrição              |
|------------|--------------|----------------------|------------------------|
| Frontend   | iwr-frontend | http://localhost:3000 | interface React (Nginx) |
| Backend    | iwr-backend  | http://localhost:3001 | API Express            |
| PostgreSQL | iwr-db       | localhost:5432       | Banco de dados         |

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login com email/senha
- `GET /api/auth/me` - Obter usuário logado

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Criar cliente (ADMIN apenas)
- `GET /api/customers/search?q=` - Buscar por nome, CPF ou telefone
- `GET /api/customers/:id` - Buscar cliente por ID
- `PATCH /api/customers/:id` - Editar cliente (ADMIN apenas)

### Vendas
- `POST /api/sales` - Criar venda com itens (gera título automaticamente)
- `GET /api/sales` - Listar vendas (ADMIN apenas)
- `GET /api/sales/:id` - Buscar venda por ID

### Títulos
- `GET /api/promissory-notes` - Listar títulos com filtros
- `GET /api/promissory-notes/:id` - Buscar título por ID
- `PATCH /api/promissory-notes/:id/pay` - Baixar como pago

### Dashboard
- `GET /api/dashboard` - Métricas para painel (ADMIN apenas)

### Auditoria
- `GET /api/audit-log` - Logs de ações do sistema (ADMIN apenas)

### Usuários (ADMIN apenas)
- `GET /api/users` - Listar usuários com paginação
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário por ID
- `PATCH /api/users/:id` - Editar usuário
- `PATCH /api/users/:id/deactivate` - Desativar usuário
- `PATCH /api/users/:id/activate` - Ativar usuário
- `PATCH /api/users/:id/reset-password` - Resetar senha

### Exportação CSV
- `GET /api/customers/export-csv` - Exportar clientes para CSV
- `GET /api/promissory-notes/export-csv` - Exportar títulos para CSV

### Soft Delete
- `DELETE /api/customers/:id` - Soft delete de cliente
- `PATCH /api/customers/:id/restore` - Restaurar cliente
- `DELETE /api/sales/:id` - Soft delete de venda
- `PATCH /api/sales/:id/restore` - Restaurar venda

### Health Check
- `GET /api/health` - Status do servidor (uptime, memória, versão)

### Impressão
- `GET /print-note?id=` - Página de impressão de nota promissória

## Backup e Restore

### Backup Manual
```bash
# Criar backup
./infra/backup.sh

# Listar backups disponíveis
ls -lh backups/
```

### Restore
```bash
# Listar backups e restaurar
./infra/restore.sh

# Restaurar backup específico
./infra/restore.sh backups/iwr_moda_backup_20260407_020000.sql.gz
```

### Backup Automático (Linux/Mac)
```bash
# Editar crontab
crontab -e

# Backup diário às 2h da manhã
0 2 * * * /path/to/infra/backup.sh /path/to/backups
```

### Acesso Direto ao Banco
```bash
# Conectar ao PostgreSQL
docker exec -it iwr-db psql -U postgres -d iwr_moda

# Ver tabelas
\dt

# Query exemplo
SELECT * FROM "User";
```

## Logs e Monitoramento

### Ver Logs dos Containers
```bash
# Todos os logs
docker compose logs -f

# Logs do backend
docker compose logs -f backend

# Logs do frontend
docker compose logs -f frontend

# Logs do banco
docker compose logs -f db
```

### Health Checks
O sistema possui health checks automátos:
- Backend: `http://localhost:3001/api/health`
- Frontend: Verificação automática via Docker

### Logs Estruturados
O backend gera logs em formato JSON para cada request:
```json
{
  "timestamp": "2026-04-07T10:30:00.000Z",
  "method": "POST",
  "path": "/api/sales",
  "status": 200,
  "duration": "45ms",
  "userAgent": "Mozilla/5.0...",
  "ip": "127.0.0.1"
}
```

## Deploy de Produção

### Variáveis de Ambiente

#### Backend (.env.production)
```bash
# Banco de dados
DB_USER=postgres
DB_PASSWORD=<senha-forte-aqui>
DB_NAME=iwr_moda

# JWT
JWT_SECRET=<gere-uma-string-aleatoria-segura-aqui>
JWT_EXPIRES_IN=7d

# CORS - domínios permitidos (separados por vírgula)
CORS_ORIGIN=https://seu-dominio.com,https://www.seu-dominio.com

# Frontend
VITE_API_URL=https://api.seu-dominio.com

# Portas
FRONTEND_PORT=80
```

### Opção 1: Docker Compose (Recomendado)

```bash
# 1. Preparar arquivo de variáveis
cp .env.production.example .env.production
# Editar .env.production com valores reais

# 2. Subir tudo
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 3. Verificar status
docker compose -f docker-compose.prod.yml ps

# 4. Ver health check
curl http://localhost/api/health
```

### Opção 2: Deploy Manual via SSH

```bash
# 1. Configurar SSH no servidor de destino
ssh-keygen -t ed25519
ssh-copy-id deploy@seu-servidor

# 2. Preparar servidor remoto
ssh deploy@seu-servidor
mkdir -p /opt/iwr-moda
# Copiar .env.production para /opt/iwr-moda/.env.production

# 3. Executar deploy
./infra/deploy.sh deploy@seu-servidor
```

### Opção 3: GitHub Actions (CI/CD Automático)

1. Configurar secrets no repositório:
   - `DEPLOY_SSH_KEY`: Chave SSH privada
   - `DEPLOY_HOST`: Host do servidor
   - `DEPLOY_USER`: Usuário SSH

2. Push para `main` dispara deploy automático

### Opção 4: Cloud Providers

#### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

#### Backend + Banco (Railway/Render)
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

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
- Bug fix: busca por CPF e telefone
- Bug fix: data filter na carteira
- Bug fix: logout funcional

### Sprint 2 ✅ - Operação completa
- Edição de cliente com audit log
- Validações de formulário (nome, CPF, email, telefone)
- Logs de auditoria com filtro por entidade e ação
- Toast global para erro/sucesso em todas as páginas
- Impressão formatada de nota promissória com rota dedicada
- CPF do cliente na nota promissória
- Card "Recebimentos Hoje" no dashboard
- TypeScript sem erros (strict mode)

### Sprint 3 ✅ - Preparação para produção
- RoleGuard implementado (ADMIN vs OPERATOR)
- Permissões granulares por perfil no backend e frontend
- Error Boundary no React
- Tratamento padronizado de erros no backend (AppError class)
- Logging estruturado de requests (JSON)
- Health checks detalhados
- Schema Prisma otimizado com índices compostos
- Dockerfile de produção para frontend (Nginx multi-stage)
- CORS configurável
- Scripts de backup e restore
- Documentação operacional completa

### Sprint 4 ✅ - Melhorias Críticas e Produção
- **CRUD de Usuários** completo (criar, editar, ativar/desativar, resetar senha)
- **Paginação** em todas as listagens (clientes, vendas, títulos, audit logs, usuários)
- **Componente de paginação** reutilizável no frontend
- **Race condition corrigida** no Dashboard (updateMany ao invés de updates individuais)
- **Código morto removido** (zod-schema.ts não utilizado)
- **Tratamento de erros padronizado** em todos os controllers (error-handler helper)
- **Soft delete** para clientes e vendas (com restore)
- **overdue-cron.ts otimizado** para reutilizar OverdueJobService
- **Exportação CSV** para clientes e títulos
- **Testes automatizados** configurados com Vitest
- **lastLoginAt** rastreado no login

### Sprint 5 ✅ - Validações e Tipagem TypeScript
- **Validações de formulário** com feedback visual (clientes, usuários, PDV)
- **Validação de CPF** com dígitos verificadores reais
- **Validação de email, telefone e senha** em todos os formulários
- **PDV com validações visuais** em descrição, valor e seleção de cliente
- **Mensagens de erro inline** nos campos
- **Tipagem TypeScript** revisada - zero `any` no código
- **Interfaces tipadas** para exportação CSV

## Testes Automatizados

### Backend
```bash
# Rodar testes em modo watch
npm test

# Rodar testes uma vez
npm run test:run

# Rodar testes com cobertura de código
npm run test:coverage
```

### Cobertura de Testes
- CustomerService: CRUD, busca por CPF duplicado, paginação
- UserService: CRUD, ativação/desativação, reset de senha, validações

## Melhorias de Produção Implementadas

Ver `txt.txt`
