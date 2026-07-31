# Ambiente de homologação — passo a passo

> Como ter um ambiente de testes separado da produção, usando a mesma conta
> Vercel + Supabase que você já tem, sem risco de misturar dados reais de
> beneficiários com testes.

## O que você já tem de graça

Como o repositório está importado na Vercel com integração Git automática,
**toda branch/PR já ganha uma URL de preview própria sozinha** — isso não
precisa ser configurado, já existe hoje. O que falta é só uma coisa: hoje,
qualquer preview deploy aponta pro **mesmo banco Supabase de produção**
(porque usa a mesma `DATABASE_URL`). É isso que precisa mudar.

⚠️ **Atenção**: o script de build do projeto é
`prisma generate && prisma db push && next build` — ou seja, **todo deploy
(inclusive de preview) aplica o schema no banco configurado**. Enquanto não
existir um banco separado, testar uma branch em preview pode alterar/mexer
no banco de produção de verdade. Esse é o motivo principal pra fazer esse
setup antes de continuar testando por preview.

## Passo 1 — Criar um segundo projeto no Supabase (só você, no painel)

1. [supabase.com](https://supabase.com) → **New project**
2. Nome sugerido: `cesta-solidaria-homologacao`
3. Anote a connection string em **Settings → Database** (vai gerar
   `DATABASE_URL` em "Transaction mode" e `DIRECT_URL` em "Session mode",
   igual ao que você já configurou pra produção)
4. Em **Settings → API**, anote `SUPABASE_URL` e a `service_role key`
   (`SUPABASE_SERVICE_KEY`)
5. Crie o bucket de storage igual ao de produção:
   - **Storage → New bucket** → nome `comprovantes` → marcar **Public bucket**

## Passo 2 — Criar as tabelas nesse banco novo (local, uma vez)

Com o `.env` local temporariamente apontando pras credenciais do projeto de
**homologação** (não o de produção!):

```bash
npm run db:generate
npm run db:push
```

Isso cria a mesma estrutura de tabelas no banco novo, vazio.

## Passo 3 — Configurar as variáveis de ambiente na Vercel por ambiente

No painel da Vercel: **Project → Settings → Environment Variables**.

A Vercel permite ter o **mesmo nome de variável com valores diferentes**
por ambiente (Production / Preview / Development). Configure:

| Variável | Ambiente **Production** | Ambiente **Preview** |
|---|---|---|
| `DATABASE_URL` | banco de produção (o que já está lá) | banco de **homologação** |
| `DIRECT_URL` | idem | idem |
| `SUPABASE_URL` | idem | idem |
| `SUPABASE_SERVICE_KEY` | idem | idem |
| `NEXTAUTH_SECRET` | pode ser o mesmo ou um diferente (recomendo diferente, por segurança) | secret próprio de teste |
| `NEXTAUTH_URL` | URL de produção (`https://seudominio...`) | deixe em branco/URL genérica — cada preview tem URL própria; ver observação abaixo |

Ao editar cada variável na Vercel, existe um seletor de "Environment" — é ali
que você marca se o valor vale pra Production, Preview, Development, ou
todos. É isso que faz o preview parar de tocar no banco real.

**Sobre `NEXTAUTH_URL` em preview**: como cada preview deploy tem uma URL
diferente, um valor fixo não serve pra todos. Duas opções: (a) aceitar que o
login talvez precise de ajuste manual por deploy de preview, ou (b) me pedir
depois pra ajustar `src/lib/auth.ts`/`next.config` pra detectar a URL
automaticamente via `VERCEL_URL` (variável que a própria Vercel injeta) — não
fiz essa mudança de código agora pra não misturar com a configuração de
ambiente, mas é simples de fazer depois.

## Passo 4 — Criar a branch de homologação

Vou criar uma branch `homologacao` local a partir do trabalho atual (que já
tem o redesign visual + ícones novos pendentes). Depois de você revisar, eu
empurro (`git push`) pra origin — só faço isso com sua confirmação, já que
sobe pro repositório compartilhado.

## Fluxo do dia a dia, depois de configurado

```
feature/xyz  →  PR/push pra homologacao  →  testa na URL de preview
                                              (banco de homologação)
                     ↓ ok?
              PR homologacao → master     →  Vercel builda produção
                                              (banco de produção)
```

## Resumo do que eu consigo fazer vs. o que só você faz

| Tarefa | Quem faz |
|---|---|
| Criar branch `homologacao` | Eu (local, e faço push com sua confirmação) |
| Criar projeto novo no Supabase | Você (painel) |
| Rodar `db:push` no banco novo | Eu, se você me passar as credenciais temporariamente, ou você mesmo |
| Criar bucket `comprovantes` no Supabase novo | Você (painel) |
| Configurar Environment Variables por ambiente na Vercel | Você (painel) — eu não tenho acesso |
| Ajustar `NEXTAUTH_URL` dinâmico (opcional) | Eu, se pedir |
