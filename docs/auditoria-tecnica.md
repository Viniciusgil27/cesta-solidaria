# Auditoria técnica — Cesta Solidária (AltVida)

> Levantamento completo da stack, dependências, arquitetura e infraestrutura
> do projeto, com foco em preparar uma futura migração para servidor e banco
> próprios. Baseado em leitura direta de `package.json`, `package-lock.json`,
> `tsconfig.json`, `next.config.mjs`, `prisma/schema.prisma`, código-fonte de
> `src/`, e no ambiente de desenvolvimento local usado nesta auditoria.

Data da auditoria: 2026-07-31.

---

## 1. Linguagens

| Item | Detalhe |
|---|---|
| **Node.js** | Instalada neste ambiente: **v24.18.0**. `package.json` **não declara** campo `engines` — não há versão mínima exigida formalmente pelo projeto. |
| **Node.js recomendada** | Next.js 14.2.3 (versão em uso) exige oficialmente `^18.17.0 \|\| ^19.8.0 \|\| >= 20.0.0`. O README também recomenda "Node.js 18+". Node 24 (atual) funciona (build e dev testados nesta sessão), mas é uma versão mais nova do que a testada oficialmente pelo Next 14. |
| **TypeScript** | `5.9.3` (resolvido via `package-lock.json`; `package.json` pede `^5`). `strict: true` ativado em `tsconfig.json`. |
| **JavaScript** | Usado só em arquivos de configuração/script (`next.config.mjs`, `postcss.config.js`, `scripts/generate-icons.mjs`) — todo o código de aplicação é TypeScript (`.ts`/`.tsx`). |

## 2. Frameworks

| Item | Versão instalada | Observação |
|---|---|---|
| **Next.js** | `14.2.3` (App Router) | Não é a versão mais recente da linha 14, e Next já está na versão 16 publicamente (confirmado nesta sessão: um `npx next dev` fora do diretório do projeto baixou `16.2.12` como versão mais atual do pacote). Dois majors atrás do topo. |
| **React** | `18.3.1` | React 19 já existe (par natural do Next 15+). Um major atrás. |
| **Tailwind CSS** | `3.4.19` | Tailwind v4 já existe (o site de referência usado no trabalho de redesign visual, aliás, já roda em v4). Um major atrás. Configuração é `tailwind.config.ts` clássica (não usa a sintaxe `@theme` do v4). |

## 3. Banco de Dados

| Item | Detalhe |
|---|---|
| **Banco utilizado** | PostgreSQL, hospedado no **Supabase**. |
| **ORM** | Prisma. |
| **Versão do Prisma** | `6.19.3` (`prisma` e `@prisma/client` — ambos na mesma versão, como recomendado). Versão atual e recente da linha 6. |
| **Migrations existentes** | Uma única migration versionada: `prisma/migrations/20260529010734_init/` (cria todas as tabelas do zero). Na prática, o fluxo de trabalho do dia a dia usa `npm run db:push` (schema push direto, sem gerar migration nova) — ver `README.md` e script `db:push` em `package.json`. Isso significa que o histórico de migrations **não reflete** o estado atual do schema; só a migration inicial existe. |
| **Schema atual** | 5 models: `Admin`, `Beneficiario`, `Entrega`, `Retirada` (join table beneficiário↔entrega), `Voluntario`. 3 enums: `EntregaStatus`, `StatusCadastro`, `StatusVoluntario`. `datasource` declara `DATABASE_URL` (pooled/transaction mode) e `directUrl` = `DIRECT_URL` (session mode) — padrão específico do pooler do Supabase (PgBouncer). |

## 4. Backend

**Estrutura das API Routes** (Next.js Route Handlers, `src/app/api/**/route.ts`):

```
api/
  admins/                      GET, POST
  admins/[id]/                 PATCH, DELETE
  auth/[...nextauth]/          NextAuth handler
  beneficiarios/                GET, POST
  beneficiarios/[id]/           GET, PUT, DELETE
  beneficiarios/[id]/aprovar/   PUT
  beneficiarios/[id]/rejeitar/  PUT
  beneficiarios/cpf/[cpf]/      GET  (lookup na tela de entrega)
  beneficiarios/importar/       POST (importação em lote via Excel)
  beneficiarios/pendentes/      GET
  consulta/[cpf]/               GET  (consulta pública de status)
  entregas/                     GET, POST
  entregas/[id]/                PATCH (encerrar)
  entregas/[id]/retirada/       POST (confirmar retirada)
  voluntarios/                  GET, POST
  voluntarios/[id]/             GET, PUT, DELETE
  upload/comprovante/           POST (upload direto para Supabase Storage)
```

Todas acessam o banco via `prisma` (singleton em `src/lib/prisma.ts`, padrão global para evitar múltiplas conexões em dev).

**Estratégia de autenticação**: NextAuth.js v4 (`next-auth@4.24.14`), `CredentialsProvider` (email + senha com hash `bcryptjs`), sessão via **JWT** (`maxAge: 8h`), sem adapter de banco (a validação de credenciais é manual contra a tabela `Admin` em `src/lib/auth.ts`). Proteção de rotas em duas camadas:
1. `src/middleware.ts` — `withAuth` do `next-auth/middleware`, matcher em `/admin` e `/admin/*` exceto `/admin/login`.
2. `src/app/admin/(protected)/layout.tsx` — segunda checagem via `getServerSession` no servidor, redireciona se não autenticado.

**Bibliotecas de backend**: `@prisma/client`, `next-auth`, `bcryptjs` (hash de senha), `xlsx` (parse/geração de planilhas, usado tanto em API routes quanto client-side).

## 5. Frontend

Levantamento honesto — este projeto **não usa bibliotecas dedicadas** na maioria das categorias abaixo; tudo é resolvido com HTML/Tailwind puro e `useState`:

| Categoria | Biblioteca usada | Observação |
|---|---|---|
| **UI (componentes)** | Nenhuma biblioteca de terceiros. Biblioteca própria em `src/components/ui/*` (13 componentes: Button, Card, Badge, FormField, Modal, ConfirmDialog, Toast, EmptyState, LoadingState, DataTable, StatCard, Header, Footer, AdminShell), construída neste projeto. | Não há shadcn/ui, Radix, MUI, Chakra, etc. |
| **Formulário** | Nenhuma. Todos os formulários usam `useState` manual + `onChange` handlers escritos à mão. | Sem `react-hook-form`, `formik`. |
| **Validação** | Nenhuma biblioteca. Validação é manual (`if` no client e nas API routes). | Sem `zod`, `yup`, `valibot`. Isso inclui a validação de CPF, que é uma função própria (`cpfValido` em `src/lib/utils.ts`). |
| **Upload** | Nenhuma biblioteca de upload. `<input type="file">` nativo + `fetch` com `FormData` direto para a API route, que repassa para o Supabase Storage via REST cru (sem SDK). | Sem `react-dropzone`, `uppy`, `@supabase/supabase-js`. |
| **Gráficos** | Nenhuma. O projeto não tem nenhuma visualização de dados em gráfico. | Sem `recharts`, `chart.js`, `visx`. |
| **Tabelas** | Nenhuma biblioteca de tabela. Listas são renderizadas como cards empilhados (`DataList`/`DataRow` própria) — decisão deliberada de UX mobile-first, não usa `<table>` em telas admin. | Sem `tanstack-table`, `ag-grid`. |
| **Animação** | Nenhuma biblioteca. Só transições CSS/Tailwind (`transition-colors`, `animate-spin` nativo do Tailwind). | Sem `framer-motion`, `react-spring`. |
| **Ícones** | Nenhuma biblioteca de ícones. Uso de **emoji Unicode** diretamente no JSX (🧺, 👥, 📋 etc.) e alguns SVGs inline pontuais. | Sem `lucide-react`, `heroicons`, `react-icons`. |

## 6. Infraestrutura

| Item | Detalhe |
|---|---|
| **Hospedagem atual** | Vercel (inferido: `README.md` documenta deploy via `vercel` CLI; não há `vercel.json` no repo — configuração via painel/CLI, não versionada em arquivo). Nenhum outro provedor (Netlify, Railway, Render, AWS) identificado. |
| **Banco atual** | Supabase (Postgres gerenciado), acessado só via Prisma (`DATABASE_URL`/`DIRECT_URL`). |
| **Storage atual** | Supabase Storage, bucket público `comprovantes`, acessado via **REST API cru** (`fetch` direto para `{SUPABASE_URL}/storage/v1/object/...`) em `src/app/api/upload/comprovante/route.ts` — não usa o SDK `@supabase/supabase-js` (que nem está nas dependências). |
| **Variáveis de ambiente** (de `.env.example`) | `DATABASE_URL`, `DIRECT_URL` (Postgres/Supabase, pooled vs. direto), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. Nenhum `.env` real está commitado (corretamente ignorado via `.gitignore`). |
| **Integrações externas** | Só Supabase (banco + storage). Não há Stripe, envio de email/SMS, WhatsApp API (apesar de o texto da UI mencionar contato "pelo WhatsApp", isso é manual — não há integração automatizada), Sentry, analytics, ou qualquer outro serviço terceiro identificado no código. |

## 7. Ferramentas e dependências — tabela completa

| Ferramenta | Versão | Finalidade | Arquivo onde foi identificada |
|---|---|---|---|
| Node.js | v24.18.0 (ambiente local) | Runtime JS | ambiente (sem `.nvmrc`/`engines`) |
| npm | 11.16.0 (ambiente local) | Gerenciador de pacotes | `package-lock.json` (lockfileVersion 3) |
| Next.js | 14.2.3 | Framework fullstack (App Router) | `package.json`, `next.config.mjs` |
| React | 18.3.1 | Biblioteca de UI | `package.json` |
| React DOM | 18.3.1 | Renderização DOM | `package.json` |
| TypeScript | 5.9.3 | Tipagem estática | `package.json`, `tsconfig.json` |
| Tailwind CSS | 3.4.19 | Estilização utilitária | `package.json`, `tailwind.config.ts` |
| PostCSS | 8.5.15 | Pipeline CSS (via Tailwind/Autoprefixer) | `postcss.config.js` |
| Autoprefixer | 10.5.0 | Prefixos CSS automáticos | `postcss.config.js` |
| Prisma (CLI) | 6.19.3 | Migrations/schema/codegen | `package.json`, `prisma/schema.prisma` |
| @prisma/client | 6.19.3 | Client de acesso ao banco | `package.json`, `src/lib/prisma.ts` |
| PostgreSQL | (versão gerenciada pelo Supabase, não fixada no projeto) | Banco de dados relacional | `prisma/schema.prisma` (`provider = "postgresql"`) |
| NextAuth.js | 4.24.14 | Autenticação (Credentials + JWT) | `package.json`, `src/lib/auth.ts` |
| bcryptjs | 2.4.3 | Hash de senha | `package.json`, `src/lib/auth.ts` |
| xlsx (SheetJS) | 0.18.5 | Leitura/geração de planilhas Excel | `package.json`, páginas de importar/exportar |
| clsx | 2.1.1 | Composição condicional de classes CSS | `package.json`, `src/lib/utils.ts` |
| tailwind-merge | 2.6.1 | Merge inteligente de classes Tailwind | `package.json`, `src/lib/utils.ts` |
| date-fns | 3.6.0 | Utilitários de data | `package.json` (presente na dependência; uso direto não identificado nas páginas revisadas — formatação de data é feita via `Intl`/`toLocaleDateString` nativo em `src/lib/utils.ts`) |
| ESLint | 8.57.1 | Lint de código | `package.json` |
| eslint-config-next | 14.2.3 | Regras de lint específicas do Next | `package.json` |
| Git | (versão do sistema, não fixada) | Controle de versão | `.git/`, `.gitignore` |
| GitHub | — | Hospedagem do repositório remoto | `git remote` → `github.com/Viniciusgil27/cesta-solidaria` |
| Vercel | — (inferida) | Hospedagem/deploy | `README.md` (seção "Deploy na Vercel") |
| Supabase | — (gerenciado, sem SDK no projeto) | Banco Postgres + Storage | `.env.example`, `src/app/api/upload/comprovante/route.ts` |

**Não encontrados no projeto** (mencionados no exemplo do pedido, mas ausentes aqui): Prettier, Husky, GitHub Actions, Docker, PM2, Nginx, `@supabase/supabase-js`. Nenhum arquivo de configuração de ESLint (`.eslintrc*` ou `eslint.config.*`) está commitado — o projeto depende da configuração padrão que `next lint` normalmente pede para gerar na primeira execução; **não há evidência de que `next lint` já tenha sido rodado/configurado neste repo**.

## 8. Dependências — produção vs. desenvolvimento

**`dependencies` (produção)** — de `package.json`:
```
@prisma/client   ^6.19.3
bcryptjs         ^2.4.3
clsx             ^2.1.1
date-fns         ^3.6.0
next             14.2.3
next-auth        ^4.24.7
react            ^18
react-dom        ^18
tailwind-merge   ^2.3.0
xlsx             ^0.18.5
```

**`devDependencies` (desenvolvimento)**:
```
@types/bcryptjs     ^2.4.6
@types/node         ^20
@types/react        ^18
@types/react-dom    ^18
autoprefixer         ^10.0.1
eslint               ^8
eslint-config-next  14.2.3
postcss              ^8
prisma              ^6.19.3
typescript           ^5
```

Observação: `@types/node` está fixado em `^20`, mas o Node instalado no ambiente é a v24 — os tipos de Node não acompanham a versão real do runtime (isso não quebra nada hoje, mas pode causar tipos desatualizados/faltantes de APIs mais novas do Node).

## 9. Ambiente

| Item | Detalhe |
|---|---|
| Versão mínima necessária do Node | Não declarada no projeto; recomendação do Next 14 é `^18.17.0 \|\| ^19.8.0 \|\| >= 20.0.0` |
| Versão atualmente utilizada (neste ambiente) | v24.18.0 |
| Sistema operacional esperado | Nenhum SO específico exigido pelo código (é um app Next.js padrão). Ambiente desta auditoria: Windows (MINGW64/Git Bash). Scripts npm são cross-platform. |
| Como executar localmente | `npm install` → configurar `.env` (copiar de `.env.example`) → `npm run db:generate && npm run db:push` → `npm run dev` |
| Como gerar build | `npm run build`, que executa `prisma generate && prisma db push && next build` — **atenção**: isso significa que todo build (inclusive local) tenta empurrar o schema para o banco configurado em `DATABASE_URL`, não é só compilação. |
| Como executar em produção | `npm run start` (depois de `npm run build`), ou deploy na Vercel (que roda o mesmo `build` script automaticamente) |

## 10. Arquitetura

**Organização de pastas**:
```
src/
  app/                    rotas (App Router) — páginas + API routes colocated
    api/**/route.ts       backend (Route Handlers)
    admin/(protected)/    grupo de rotas admin com layout de guarda de sessão
    admin/login/
    cadastro/, consulta/, voluntarios/   páginas públicas
  components/
    ui/                   biblioteca de componentes própria (promovida nesta sessão)
    admin/                componentes específicos de admin (SignOutButton, NovaEntregaButton)
  lib/                    prisma client, auth config, utils (formatação/validação)
  types/                  tipos TS compartilhados (espelham os models do Prisma)
prisma/                   schema, migrations, seed
public/                   assets estáticos + ícones PWA
scripts/                  scripts utilitários (geração de ícone)
```

**Fluxo do frontend**: páginas em `src/app/**/page.tsx`, a maioria `'use client'` com `useState`/`useEffect` fazendo `fetch` direto às API routes (sem camada de data-fetching como React Query/SWR). Componentes de UI compartilhados vêm de `src/components/ui`. Estilização via Tailwind + tokens CSS custom properties (`--tpl-*`) definidos em `src/app/globals.css`.

**Fluxo do backend**: Route Handlers (`route.ts`) recebem a requisição, validam entrada manualmente, chamam `prisma` (client singleton), retornam JSON via `NextResponse.json`. Não há camada de serviço/repositório separada — a lógica fica direto na route handler.

**Fluxo do banco**: Prisma Client → Postgres (Supabase) usando duas connection strings (pooled para queries normais via `DATABASE_URL`, direta para operações que exigem conexão persistente via `DIRECT_URL` — ex. migrations). Schema versionado em `prisma/schema.prisma`, aplicado via `db push` no dia a dia (não via migrations incrementais).

**Fluxo de autenticação**: usuário envia email/senha em `/admin/login` → `signIn('credentials', ...)` do NextAuth → `authorize()` em `src/lib/auth.ts` busca `Admin` no Postgres, compara hash com `bcryptjs` → gera JWT de sessão (8h) → `middleware.ts` + o layout do grupo `(protected)` verificam essa sessão em toda navegação admin.

**Fluxo de upload**: usuário seleciona imagem no formulário público de cadastro → `FormData` → `POST /api/upload/comprovante` → a API route valida tipo/tamanho no servidor → envia o buffer via `fetch` cru para a Storage API do Supabase, autenticado com a `service_role key` → retorna a URL pública, que é salva como `comprovanteUrl` no registro do `Beneficiario` via Prisma.

**Fluxo de deploy**: push no GitHub → (inferido) Vercel detecta e builda automaticamente → `npm run build` roda `prisma generate && prisma db push && next build` → deploy da build servida pela infraestrutura da Vercel (Edge/Node runtime conforme cada rota).

## 11. Migração de infraestrutura (saindo de Vercel + Supabase)

**Podem ser mantidos sem alteração** (zero acoplamento a Vercel/Supabase):
- Todo o código de UI/frontend (`src/components/ui`, páginas, Tailwind, tokens de design)
- Prisma + schema (`provider = "postgresql"` é genérico — qualquer Postgres serve)
- NextAuth com `CredentialsProvider` + JWT (não usa nenhum adapter/serviço externo)
- `bcryptjs`, `xlsx`, `clsx`, `tailwind-merge`, `date-fns` — bibliotecas 100% independentes de infraestrutura
- Toda a lógica de negócio nas API routes (usam só Prisma, nada específico de Supabase)
- **Achado importante**: nenhum pacote npm do projeto é Vercel- ou Supabase-specific. Não há `@vercel/*` nem `@supabase/supabase-js` nas dependências.

**Precisarão ser reconfigurados**:
- **Connection string do banco**: trocar `DATABASE_URL`/`DIRECT_URL` para o Postgres próprio. O padrão atual (`pgbouncer=true` na porta 6543 + `directUrl` na 5432) é específico do pooler do Supabase — num Postgres próprio, isso vira ou uma única `DATABASE_URL` direta, ou configurar um pooler equivalente (ex. PgBouncer) se o volume de conexões justificar.
- **Upload de arquivos** (`src/app/api/upload/comprovante/route.ts`): é o ponto **mais acoplado** ao Supabase — faz chamadas REST cruas à API de Storage dele. Precisa ser reescrito por completo para o novo destino de armazenamento (ex. S3/MinIO/R2/disco local + servidor de arquivos estático). Não é uma troca de variável de ambiente, é reescrita de código.
- **`NEXTAUTH_URL`**: precisa apontar para o novo domínio.
- **Deploy/hosting**: sem Vercel, é preciso montar servidor Node (`next start`) + processo supervisor (ex. PM2) + reverse proxy com TLS (ex. Nginx + certbot) — nada disso existe hoje no repo, precisa ser criado do zero (não há `Dockerfile`, `docker-compose.yml`, nem config de Nginx/PM2 no projeto atual).
- **Script de build** (`prisma generate && prisma db push && next build`): recomendo revisar para produção própria — `db push` aplica o schema diretamente sem histórico de migration; em produção própria, `prisma migrate deploy` é mais seguro e auditável.

**Dependências que continuarão funcionando normalmente**: literalmente todas as listadas na seção 8 — nenhuma delas é Vercel/Supabase-specific.

**Integrações que dependem especificamente de Vercel ou Supabase**:
- Supabase: conexão Postgres (config, não código) e Storage (código, precisa reescrever)
- Vercel: só a conveniência de deploy automático + variáveis de ambiente pelo painel — nenhuma API/SDK da Vercel é importada no código (sem Vercel KV, Blob, Edge Config, Analytics)

## 12. Achados que merecem atenção antes da migração

1. **`xlsx` (SheetJS) travado em `0.18.5`**: essa é a última versão publicada no registro público do npm — o projeto SheetJS passou a distribuir versões mais novas (com correções de segurança conhecidas, incluindo ReDoS/prototype pollution reportados em versões antigas da lib) só pelo CDN próprio deles, fora do npm. Vale avaliar se a versão atual tem alguma dessas vulnerabilidades e, se sim, migrar para a distribuição oficial fora do npm ou trocar de biblioteca.
2. **Sem `engines` no `package.json`**: nada impede alguém de rodar `npm install` com uma versão de Node incompatível sem aviso. Vale declarar `engines.node`.
3. **Sem lockfile de versão de Node** (`.nvmrc`/`.node-version`): importante para reprodutibilidade ao trocar de servidor.
4. **Nenhuma config de ESLint commitada**: o lint provavelmente nunca rodou de forma consistente neste projeto.
5. **`db push` em vez de migrations versionadas**: só existe 1 migration real no histórico; o schema pode ter divergido dela ao longo do tempo sem deixar rastro auditável — antes de migrar de banco, vale gerar uma migration atual fiel ao schema real (`prisma migrate diff` contra o banco de produção) para não perder histórico.
6. **Upload de comprovante sem SDK, via REST cru com a `service_role key`**: funciona, mas concentra toda a lógica de autenticação com o Storage num único arquivo sem abstração — ponto certo (e único) a ser inteiramente reescrito na migração de storage.
7. **Next.js 14 / React 18 / Tailwind 3 / ESLint 8 / NextAuth 4**: toda a stack está uma versão major atrás do estado da arte atual (Next 16, React 19, Tailwind 4, ESLint 9, NextAuth 5/Auth.js). Nenhuma delas está fora de suporte ainda, mas é uma dívida técnica a considerar — principalmente Tailwind 3 (o site de referência usado no redesign visual recente já roda em Tailwind 4, então há uma pequena divergência de geração de ferramenta entre o que foi usado como inspiração e o que o projeto roda).
8. **Ícones PWA com a cor antiga**: gerados por `scripts/generate-icons.mjs`, que tem a cor roxa (`#3C2A6E`) hardcoded na constante `ROXO`. Achado relevante para o trabalho de redesign visual recente (não para a migração de infra): é só rodar o script de novo depois de trocar essa constante para `#8b2020`.
