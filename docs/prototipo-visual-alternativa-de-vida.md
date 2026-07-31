# Identidade visual "Alternativa de Vida" — histórico e estado atual

> Este documento existe para que qualquer pessoa (ou instância do Claude) que
> abra este repo depois entenda rapidamente o que foi feito, por quê, e o que
> falta decidir.

## Status: promovido a produção

Isto começou como um protótipo isolado em `/template-visual` (identidade
vinho/creme, Playfair Display + Inter, componentes reutilizáveis), aprovado
pelo usuário depois de corrigir dois bugs de layout mobile. Em seguida foi
**promovido para produção**: a aparência antiga (roxo `#3C2A6E`, sem
componentes reutilizáveis) foi substituída em todas as páginas reais, mantendo
100% da lógica de negócio (Prisma, NextAuth, upload, import/export Excel).

O protótipo isolado (`src/app/template-visual`, `src/components/template-alternativa`,
`src/lib/template-alternativa`, `src/styles/template-alternativa.css`) **não
existe mais** — foi removido depois da promoção. O que sobrou é definitivo:

```
src/app/globals.css                 # tokens --tpl-* em :root (era escopado em .tpl-av no protótipo)
src/app/layout.tsx                  # fontes Inter + Playfair Display via next/font
src/app/manifest.ts                 # cores do PWA atualizadas
src/components/ui/**                # 13 componentes (Button, Card, Badge, FormField, Modal,
                                     # ConfirmDialog, Toast, EmptyState, LoadingState, DataTable,
                                     # StatCard, Header, Footer, AdminShell)
src/components/admin/SignOutButton.tsx, NovaEntregaButton.tsx   # reskin, lógica inalterada
```

Todas as ~20 páginas reais (públicas e `/admin/**`) foram reescritas para usar
`src/components/ui/*`, preservando exatamente as mesmas chamadas de API,
queries Prisma e handlers que já existiam.

## Decisões de design (resumo)

Extraídas do CSS real do site de referência **alternativadevida.com.br** (não
de suposição visual — via `curl` na home + nos bundles `_next/static/chunks/*.css`):

- **Cor primária**: vinho `#8b2020` (tokens `--tpl-primary*`).
- **Fundo**: creme `#fdf6e8` (era cinza `slate-50`).
- **Tipografia**: `Playfair Display` (serifada, títulos) + `Inter` (corpo).
- Cor de erro/rejeição (`--tpl-danger`, vermelho puro) é **deliberadamente
  diferente** da cor da marca, para não confundir "ação primária" com "erro".
- Listas administrativas usam cards empilhados (`DataList`/`DataRow`), não
  `<table>` — mobile-first, evita rolagem horizontal.
- `AdminShell` (sidebar desktop / tab-bar mobile) é uma navegação que **não
  existia antes** no app real — cada página admin era uma ilha sem link entre
  telas.

## Bugs mobile corrigidos durante a migração

Dois bugs de layout em telas pequenas (320px), encontrados no protótipo e
replicados intencionalmente no app real antes da promoção:

1. **Lista de beneficiários/voluntários**: nome + 3 (ou 2) botões de ação na
   mesma linha espremiam o texto até quebrar letra por letra. Corrigido
   empilhando avatar+texto numa linha e os botões numa grade abaixo, só em
   telas pequenas.
2. **Busca de CPF (`/admin/entrega`)**: campo de input sem `min-w-0` num
   flexbox não conseguia encolher, empurrando o botão "Buscar" para fora da
   tela. Corrigido com `min-w-0` no input + `flex-shrink-0` no botão.

## Funcionalidades restauradas na promoção (o protótipo simulava, produção não pode)

- `/admin/pendentes` mostra a **imagem real** do comprovante de residência
  (`b.comprovanteUrl`), não um placeholder.
- `/consulta` e `/admin/entrega` chamam as API routes reais
  (`/api/consulta/[cpf]`, `/api/beneficiarios/cpf/[cpf]`).
- Login usa `signIn('credentials', ...)` real do NextAuth.
- Import/export de Excel mantêm 100% a lógica `xlsx` client-side + API routes
  reais (nada foi simplificado).

## Pendências conhecidas

- **Ícones PWA** (`/public/icons/icon-*.png`) ainda têm a cor roxa antiga
  embutida na imagem — não foram regenerados (fora do escopo desta migração,
  exigiria arte nova).
- Configurar `.env` local (`DATABASE_URL` etc. — ver `.env.example`) continua
  necessário para rodar o sistema completo localmente; não tem relação com
  esta migração visual.

## Validação executada

- `npx tsc --noEmit` e `npx next build` (não `npm run build`, para não
  disparar `prisma db push` contra o Supabase real).
- Smoke test de todas as rotas reais via dev server.
- Conferência visual mobile (320px) das telas que tinham bug conhecido.
