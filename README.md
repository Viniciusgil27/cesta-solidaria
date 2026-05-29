# Cesta Solidária AltVida

Plataforma de gestão de distribuição de cestas básicas da Comunidade Batista Alternativa de Vida.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Prisma ORM**
- **PostgreSQL** via Supabase
- **NextAuth.js** (autenticação JWT)

---

## 1. Configurar o Supabase (banco de dados gratuito)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings → Database → Connection string → URI**
4. Copie a URL (parece com: `postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres`)

---

## 2. Clonar e instalar

```bash
# Clone ou copie os arquivos do projeto
cd cesta-solidaria

# Instale as dependências
npm install
```

---

## 3. Configurar variáveis de ambiente

Edite o arquivo `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="gere-um-segredo-com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 4. Criar as tabelas no banco

```bash
# Gera o client Prisma
npm run db:generate

# Cria as tabelas no Supabase
npm run db:push
```

---

## 5. Criar o primeiro super admin (você)

Edite o arquivo `prisma/seed.ts` e troque:
- `email: 'vinicius@altvida.org'` → seu email real
- `nome: 'Vinicius'` → seu nome
- A senha `SenhaSuperSecreta123!` → uma senha forte

Depois rode:

```bash
npx ts-node prisma/seed.ts
```

Pronto — seu usuário admin está criado no banco.

---

## 6. Rodar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 7. Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça deploy
vercel

# Adicione as variáveis de ambiente na Vercel:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (com sua URL da Vercel)
```

---

## Fluxo de admins

1. **Você** (super admin) é criado via `prisma/seed.ts`
2. Faça login em `/admin/login`
3. Vá em **Admins** no painel
4. Clique em **+ Novo** para adicionar outros admins da igreja
5. Somente o super admin pode criar, ativar/desativar ou remover outros admins

---

## Estrutura de páginas

| Rota | Descrição |
|---|---|
| `/` | Tela pública — data, local e cadastro |
| `/cadastro` | Formulário de cadastro público |
| `/admin/login` | Login dos admins |
| `/admin` | Painel principal |
| `/admin/entrega` | Validação CPF durante distribuição |
| `/admin/beneficiarios` | Lista e edição de cadastros |
| `/admin/importar` | Importar Excel |
| `/admin/exportar` | Exportar relatórios |
| `/admin/historico` | Histórico de entregas |
| `/admin/admins` | Gerenciar admins da equipe |

---

## Páginas ainda a implementar

As seguintes páginas têm a API pronta mas precisam da UI:

- `src/app/admin/beneficiarios/page.tsx` — lista com busca, editar, remover
- `src/app/admin/beneficiarios/novo/page.tsx` — formulário de adicionar
- `src/app/admin/importar/page.tsx` — upload de Excel
- `src/app/admin/exportar/page.tsx` — botões de exportação
- `src/app/admin/historico/page.tsx` — lista de entregas encerradas

O padrão de todas essas páginas está no arquivo HTML `cesta-solidaria-v4.html` — basta converter para React seguindo o mesmo estilo das páginas já criadas.
