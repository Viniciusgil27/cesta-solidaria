# Protótipo visual "Alternativa de Vida" — resumo para próximas sessões

> Este documento existe para que qualquer pessoa (ou instância do Claude) que
> abra este repo depois entenda rapidamente o que foi feito, por quê, e o que
> falta decidir. Não é uma feature em produção — é um protótipo de comparação.

## O que é

Uma proposta visual alternativa para o sistema, inspirada na identidade do
site institucional **alternativadevida.com.br** (mesmo ecossistema — Comunidade
Batista Alternativa de Vida), construída como réplica navegável de **todas as
telas reais do sistema**, isolada do app em produção.

Objetivo: comparar lado a lado o visual atual vs. essa proposta, sem nenhum
risco para o sistema em uso.

## Onde está / como acessar

Nada foi alterado em arquivos existentes — só arquivos novos:

```
src/app/template-visual/**            # 21 rotas (espelham as rotas reais)
src/components/template-alternativa/** # 13 componentes reutilizáveis
src/lib/template-alternativa/**        # dados fictícios + helpers de formatação
src/styles/template-alternativa.css    # tokens de cor/tipografia, escopados em .tpl-av
```

Rodando `npm run dev`, o protótipo fica em `http://localhost:3000/template-visual`
e o sistema real continua normalmente em `http://localhost:3000/`. Não há link
algum apontando para o protótipo a partir da UI real — acesso só por URL direta.

## Decisões de design (resumo)

Extraídas do CSS real do site de referência (não de suposição visual):

- **Cor primária**: vinho `#8b2020` (site usa "cobavi-700"), não o roxo `--roxo`
  (`#3C2A6E`) do app atual.
- **Fundo**: creme `#fdf6e8`, não cinza `slate-50`.
- **Tipografia**: `Playfair Display` (serifada, títulos) + `Inter` (corpo) —
  via `next/font/google`, sem dependência nova.
- Todos os tokens ficam em `src/styles/template-alternativa.css`, escopados em
  `.tpl-av` — nunca em `:root`, para não vazar para o resto do site.

Decisões deliberadas que fogem da cópia literal do site de referência:
- Cor de erro/rejeição (`--tpl-danger`, vermelho puro) é **diferente** da cor
  da marca (vinho), para não confundir "ação primária" com "erro".
- Listas administrativas usam cards empilhados, não `<table>` (mobile-first).
- Sem fotos de estoque — hero usa bloco de cor/gradiente.
- Nenhuma imagem real de comprovante de residência é exibida, nem no
  protótipo (é só um bloco ilustrativo com texto).

## O que foi (e não foi) implementado

Implementado: todas as 12 telas do sistema real (públicas + admin), com
componentes reutilizáveis (Button, Card, Badge, FormField, Modal,
ConfirmDialog, Toast, EmptyState, LoadingState, DataTable, StatCard, Header,
Footer, AdminShell), estados de sucesso/erro/vazio/carregamento, dados 100%
fictícios em `src/lib/template-alternativa/mock-data.ts`.

**Não implementado (por escopo, intencional):** nenhuma regra de negócio nova,
nenhuma migration/alteração no Prisma, nenhuma autenticação real, nenhum
upload real, nenhuma persistência — tudo roda em estado local (`useState`),
reseta ao recarregar a página.

## Validação já feita

- `npx tsc --noEmit` → sem erros
- `npx next build` → build de produção completo, 47 rotas geradas
  (as 21 novas + as originais), sem impacto no tamanho/comportamento das
  rotas existentes
- Todas as 20 páginas navegáveis testadas uma a uma via dev server (200 OK)
- `git status` confirmou isolamento total (só diretórios novos, nada
  modificado)

## Próximos passos (decisões pendentes do usuário)

1. **Decidir se a direção visual agrada** — comparar `/` vs `/template-visual`
   e telas admin correspondentes.
2. Se aprovado, decidir **estratégia de migração**: não é para copiar/colar o
   protótipo por cima do app real de uma vez — o ideal é migrar
   progressivamente (tokens primeiro, depois componentes, depois páginas),
   já que o app atual não tem componentes reutilizáveis (cada página
   reimplementa seu próprio header/botão/card).
3. Se aprovado, **extrair os componentes reais reutilizáveis** (fora do
   namespace `template-alternativa`) e ligá-los a dados reais/Prisma/API —
   isso é trabalho de implementação, não coberto por este protótipo.
4. Avaliar se vale reaproveitar o `AdminShell` (sidebar/tab-bar) no app real —
   é uma melhoria de navegação que falta hoje independente da decisão visual.
5. Configurar `.env` local (`DATABASE_URL`, etc. — ver `.env.example`) se
   quiser testar o sistema real (`/`) localmente; isso é independente do
   protótipo.
6. Quando a decisão for tomada, **apagar `template-visual`,
   `template-alternativa` e `template-alternativa.css`** se o protótipo for
   descartado, ou iniciar a migração incremental se for aprovado.

## Referência

Relatório de análise completo (paleta extraída do CSS, tipografia, UX,
mapa de páginas do site de referência) foi apresentado no chat antes da
implementação — não foi salvo como arquivo separado. Se precisar dele de
novo, refazer a análise em alternativadevida.com.br é rápido (ver método:
`curl` na home + nos bundles `_next/static/chunks/*.css` para extrair tokens
reais em vez de estimar visualmente).
