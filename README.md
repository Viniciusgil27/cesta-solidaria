# Cesta Solidária — AltVida

Plataforma de gestão de distribuição de cestas básicas da Comunidade Batista Alternativa de Vida · Jaraguá.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| ORM | Prisma |
| Banco de dados | PostgreSQL via Supabase |
| Autenticação | NextAuth.js (JWT) |
| Exportação | SheetJS (xlsx) |

---

## Configuração local

### 1. Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuito)

### 2. Clonar e instalar

```bash
git clone https://github.com/Viniciusgil27/cesta-solidaria.git
cd cesta-solidaria
npm install
```

### 3. Variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
# Supabase → Settings → Database → Connection string
# Use "Transaction mode" para DATABASE_URL e "Session mode" para DIRECT_URL

DATABASE_URL="postgresql://postgres.[REF]:[SENHA]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[SENHA]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Gere com: openssl rand -base64 32
NEXTAUTH_SECRET="seu-segredo-forte-aqui"

# Em produção, troque pela URL da Vercel
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Criar as tabelas

```bash
npm run db:generate   # gera o Prisma Client
npm run db:push       # cria as tabelas no Supabase
```

### 5. Criar o primeiro admin

Edite `prisma/seed.ts` com seu nome, email e senha, depois rode:

```bash
npx ts-node prisma/seed.ts
```

O seed usa `upsert` — pode ser executado novamente para atualizar a senha se necessário.

### 6. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Deploy na Vercel

```bash
npm i -g vercel
vercel
```

Adicione as variáveis de ambiente no painel da Vercel (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` com a URL de produção).

---

## Estrutura de páginas

### Área pública

| Rota | Descrição |
|---|---|
| `/` | Landing page — próxima entrega, aviso de CPF e botão de cadastro |
| `/cadastro` | Formulário de cadastro público para beneficiários |
| `/cadastro/sucesso` | Confirmação após cadastro enviado |

### Área administrativa (`/admin`)

Todas as rotas abaixo exigem autenticação.

| Rota | Descrição |
|---|---|
| `/admin/login` | Login com email e senha |
| `/admin` | Painel principal — stats, entrega ativa e atalhos |
| `/admin/entrega` | Validação de CPF e confirmação de retirada em tempo real |
| `/admin/beneficiarios` | Lista completa com busca, editar e remover |
| `/admin/beneficiarios/novo` | Formulário de cadastro manual de família |
| `/admin/beneficiarios/[id]` | Perfil completo da família |
| `/admin/beneficiarios/[id]/editar` | Edição dos dados da família |
| `/admin/historico` | Histórico de entregas encerradas com stats e exportação |
| `/admin/importar` | Importação de base via arquivo Excel (.xlsx / .xls) |
| `/admin/exportar` | Exportação de relatórios em Excel (5 tipos) |
| `/admin/admins` | Gerenciamento da equipe administrativa |

---

## Fluxo de uso

### Distribuição de cestas

1. Admin cria uma nova entrega (data + local) no painel
2. No dia da entrega, acessa **Entregar cestas**
3. Digita o CPF do beneficiário → sistema retorna: pode retirar / já retirou / não cadastrado
4. Confirma a retirada
5. Ao terminar, encerra a entrega — dados são salvos no histórico

### Gestão de beneficiários

- Cadastro manual via `/admin/beneficiarios/novo`
- Importação em lote via Excel em `/admin/importar` (colunas: `nome`, `cpf`, `telefone`, `endereco`, `bairro`)
- CPFs novos são adicionados; CPFs existentes são atualizados

### Exportação de dados

A partir de `/admin/exportar`:

| Relatório | Conteúdo |
|---|---|
| Todos os cadastros | Nome, CPF, telefone, endereço, faixas etárias |
| Quem retirou | Famílias atendidas na entrega ativa |
| Quem não retirou | Famílias pendentes na entrega ativa |
| Resumo da entrega | Totais e percentual de atendimento |
| Histórico completo | Comparativo entre todas as distribuições |

---

## Estrutura do banco de dados

```
Admin          — equipe administrativa (email + senha bcrypt, superAdmin flag)
Beneficiario   — famílias cadastradas (CPF único, moradores por faixa etária)
Entrega        — distribuições (data, local, status: ATIVA | ENCERRADA)
Retirada       — registro de quem retirou em qual entrega (unique por par)
```

---

## Scripts disponíveis

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run start        # inicia build de produção

npm run db:generate  # gera Prisma Client após mudanças no schema
npm run db:push      # aplica schema no banco sem migrations
npm run db:migrate   # cria migration versionada
npm run db:studio    # abre Prisma Studio (GUI do banco)
```
