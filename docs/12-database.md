# 12. Banco de dados — modelo e operação (DBA)

Mapeamento completo do banco Postgres (Supabase) do marketplace: tabelas, colunas, relações, RLS, triggers, storage e o fluxo de migrations versionadas.

**Provider:** Supabase (Postgres 15+) — região **Frankfurt (`eu-central-1`)**
**Schema de negócio:** `public`
**Auth:** schema `auth` (gerenciado pelo Supabase)
**Storage:** schema `storage` (bucket privado `products`)

---

## Visão geral do modelo

```
auth.users (Supabase Auth)
   │
   │ 1:1 (trigger on_auth_user_created)
   ▼
profiles ──────────────┐
                       │
products               │
   │                   │
   │ 1:N               │ N:1
   ▼                   ▼
orders ───────────► (user_id → auth.users)
   │
   │ 1:1 (order_id)
   ▼
entitlements ──────► (user_id → auth.users, product_id → products)
   │
   │ 1:N
   ▼
downloads ─────────► (entitlement_id, user_id, product_id)
```

Fluxo de dados: `auth.users` (login) → `profiles` (criado por trigger) → compra gera `orders` → confirmação gera `entitlements` → cada download registra em `downloads` e incrementa `entitlements.download_count`.

---

## Orientação: tela → tabela

Cada superfície do dashboard lê/escreve uma responsabilidade. Não misturamos “compra” com “direito de download”.

| Tela / fluxo | Lê | Escreve | Pergunta que responde |
|--------------|----|---------|------------------------|
| Signup / login | `auth.users` | `profiles` (trigger) | Quem é a conta? |
| Profile | `profiles` | `profiles.full_name` | Qual o nome? |
| Billing | `profiles.stripe_customer_id` | mesmo campo (service role) | Qual o Customer Stripe? |
| Checkout | `products`, `profiles` | Stripe + depois webhook | Qual preço e qual customer? |
| Webhook pago | — | `orders` + `entitlements` (+ `profiles.stripe_customer_id`) | A compra foi confirmada? |
| Purchases | `orders` ⋈ `products` | — | Qual template, quando, quanto? |
| My products | `entitlements` ⋈ `products` | — | O que ele pode baixar? |
| Download ZIP | `entitlements`, `products` | `downloads` + `entitlements.download_count` | Pode baixar agora? Quem baixou? |
| Store | `products` (`status = published`) | — | O que está à venda? |

**Dois registros por venda (intencional):**
- `orders` = fato financeiro (valor, moeda, data, session Stripe, status).
- `entitlements` = direito de acesso (limite e contagem de download). Unique `(user_id, product_id)`: um slot na biblioteca por produto.

O ZIP **não** fica no Postgres. Fica no bucket privado `storage.products`; `products.storage_path` é só o caminho.

Inspeção ao vivo: `node scripts/db-map.mjs`

---

## Tabelas

### `profiles`
Perfil público do usuário, espelha `auth.users`. Criado automaticamente no signup.

| Coluna | Tipo | Regras |
|--------|------|--------|
| `id` | uuid | PK, FK → `auth.users(id)` on delete cascade |
| `email` | text | preenchido pelo trigger |
| `full_name` | text | opcional — editável no dashboard |
| `stripe_customer_id` | text | unique, opcional — Customer Stripe para checkout reutilizável e Customer Portal |
| `created_at` | timestamptz | default `now()` |

### `products`
Catálogo. O conteúdo de marketing vive aqui; preço/pagamento é espelhado do Stripe.

| Coluna | Tipo | Regras |
|--------|------|--------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `slug` | text | **unique**, not null — usado na URL `/products/[slug]` |
| `name` | text | not null |
| `tagline` | text | opcional |
| `description` | text | opcional |
| `features` | jsonb | default `[]` |
| `tech_stack` | jsonb | default `[]` |
| `price_cents` | integer | default `0` — sincronizado do Stripe |
| `currency` | text | default `usd` |
| `cover_image` | text | URL/caminho da capa |
| `stripe_product_id` | text | vínculo com Stripe |
| `stripe_price_id` | text | **unique** |
| `storage_path` | text | caminho do `.zip` no bucket `products` |
| `status` | text | `draft` \| `published` (check) — só `published` é visível |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | atualizado por trigger |

### `orders`
Registro de compra (uma linha por checkout pago).

| Coluna | Tipo | Regras |
|--------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users(id)` on delete cascade |
| `product_id` | uuid | FK → `products(id)` |
| `stripe_checkout_session_id` | text | **unique** — idempotência do webhook |
| `stripe_payment_intent` | text | referência de pagamento |
| `amount_cents` | integer | valor pago |
| `currency` | text | moeda |
| `status` | text | `pending` \| `paid` \| `refunded` (check) |
| `created_at` | timestamptz | default `now()` |

### `entitlements`
Direito de download do comprador sobre um produto. **Uma por (user, product)**.

| Coluna | Tipo | Regras |
|--------|------|--------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users(id)` on delete cascade |
| `product_id` | uuid | FK → `products(id)` |
| `order_id` | uuid | FK → `orders(id)` |
| `download_count` | integer | default `0` |
| `download_limit` | integer | default `5` |
| `created_at` | timestamptz | default `now()` |
| — | — | **unique (user_id, product_id)** |

### `downloads`
Log de auditoria de cada download (rastreabilidade + antifraude).

| Coluna | Tipo | Regras |
|--------|------|--------|
| `id` | uuid | PK |
| `entitlement_id` | uuid | FK → `entitlements(id)` on delete cascade |
| `user_id` | uuid | not null |
| `product_id` | uuid | not null |
| `ip` | text | `x-forwarded-for` |
| `user_agent` | text | cabeçalho do cliente |
| `created_at` | timestamptz | default `now()` |

### `schema_migrations`
Controle interno do runner de migrations (ver abaixo).

| Coluna | Tipo | Regras |
|--------|------|--------|
| `version` | text | PK — nome do arquivo aplicado |
| `applied_at` | timestamptz | default `now()` |

---

## Row Level Security (RLS)

RLS **habilitado em todas** as tabelas de negócio. Resumo das políticas:

| Tabela | Política | Comando | Roles | Regra |
|--------|----------|---------|-------|-------|
| `profiles` | `profiles_select_own` | SELECT | authenticated | `auth.uid() = id` |
| `profiles` | `profiles_insert_own` | INSERT | authenticated | `auth.uid() = id` |
| `profiles` | `profiles_update_own` | UPDATE | authenticated | `auth.uid() = id` |
| `products` | `products_select_published` | SELECT | anon, authenticated | `status = 'published'` |
| `orders` | `orders_select_own` | SELECT | authenticated | `auth.uid() = user_id` |
| `entitlements` | `entitlements_select_own` | SELECT | authenticated | `auth.uid() = user_id` |
| `downloads` | `downloads_select_own` | SELECT | authenticated | `auth.uid() = user_id` |

**Importante:** não há políticas de INSERT/UPDATE para `orders`, `entitlements` e `downloads`. Essas escritas acontecem **apenas no servidor** via `createServiceClient()` (service role), que **bypassa RLS**. O cliente browser (anon key) só consegue **ler** o que é seu. Isso é intencional: o usuário nunca cria pedidos/entitlements diretamente.

---

## Triggers e funções

| Objeto | Quando | Efeito |
|--------|--------|--------|
| `handle_new_user()` + trigger `on_auth_user_created` | após INSERT em `auth.users` | cria linha em `profiles` com `id` e `email` (security definer) |
| `set_updated_at()` + trigger `products_set_updated_at` | antes de UPDATE em `products` | mantém `updated_at = now()` |

---

## Storage

| Bucket | Público? | Uso |
|--------|----------|-----|
| `products` | **não** (`public = false`) | armazena os `.zip` dos boilerplates |

O browser nunca acessa o bucket diretamente. A entrega é feita no servidor: o service client baixa o `.zip`, injeta o `LICENSE.txt` (watermark por comprador) e devolve o arquivo. Detalhes em [11 — Hardening](./11-marketplace-hardening.md).

---

## Privacidade e retenção de dados

Definido em `0006_download_retention.sql`. A tabela `downloads` é a única que guarda dado pessoal além do e-mail (IP e user agent), então tem ciclo de vida explícito:

| Prazo | O que acontece | Onde |
|-------|----------------|------|
| 30 dias | `ip` e `user_agent` viram `null`; o evento (quem/o quê/quando) permanece | `purge_expired_downloads(anonymise_days => 30)` |
| 180 dias | a linha é deletada | `purge_expired_downloads(retention_days => 180)` |
| exclusão da conta | `downloads` do usuário são apagados em cascata | FK `downloads_user_id_fkey → auth.users on delete cascade` |

A varredura é **oportunista**, não agendada: `purgeExpiredDownloads()` (`src/server/services/entitlements.ts`) roda em ~5% das entregas. Downloads são de baixo volume, então isso mantém a janela sem depender de `pg_cron`. Falha de purge é logada e nunca derruba o download.

`downloads` não tem policy nenhuma (deny-all): só o service role escreve, e nada na aplicação lê a tabela — os contadores do dashboard vêm de `entitlements.download_count`.

**Divulgação ao usuário:** a seção 8 da [EULA](../src/app/eula/page.tsx) descreve o watermark com e-mail dentro do `LICENSE.txt` e os prazos acima. Ao mudar os prazos aqui, atualize a EULA junto.

**Colunas não públicas:** `0005_column_privileges.sql` revoga `select` amplo em `products` para `anon`/`authenticated` e concede apenas as colunas da vitrine. `storage_path`, `stripe_price_id` e `stripe_product_id` só são legíveis pelo service role — por isso `getPublishedProductForCheckout` usa o service client.

---

## Migrations versionadas

As migrations são arquivos SQL em `supabase/migrations/`, aplicados em ordem alfabética e registrados em `public.schema_migrations` (cada arquivo roda **uma única vez**, dentro de uma transação).

| Arquivo | Conteúdo |
|---------|----------|
| `0001_init.sql` | tabelas, RLS, triggers, funções |
| `0002_storage.sql` | bucket privado `products` |
| `0003_profile_billing.sql` | `profiles.stripe_customer_id` |
| `0004_hardening.sql` | RLS de `profiles`, RPC de download, policies de orders |

Catálogo (MeterKit + IDs Stripe de Test) **não** é migration. Fica em `supabase/seeds/` — `npm run db:seed`. Idempotente; não registra em `schema_migrations`.

### Runner

`scripts/migrate.mjs` — conecta via `POSTGRES_URL_NON_POOLING` (do `.env.local`), garante a tabela de controle, aplica os pendentes e registra a versão.

```bash
npm run db:migrate
```

Saída típica:

```
apply  0001_init.sql
apply  0002_storage.sql
Done. 2 migration(s) applied.
```

Rodar de novo é seguro — migrations já aplicadas aparecem como `skip`.

### Como criar uma nova migration

1. Crie `supabase/migrations/0003_<descricao>.sql` (numeração crescente).
2. Escreva SQL **idempotente quando possível** (`create table if not exists`, `on conflict do nothing`).
3. Rode `npm run db:migrate`.
4. Confira o resultado com `node scripts/db-inspect.mjs`.

> **Produção:** aplique as mesmas migrations no banco de produção com o mesmo runner (apontando as envs de produção) ou via `supabase db push` com o CLI linkado. Faça backup antes de mudanças destrutivas.

### Inspeção do schema

`scripts/db-inspect.mjs` (read-only) lista tabelas, políticas RLS e buckets. `scripts/db-map.mjs` lista colunas, FKs, contagens e migrations aplicadas:

```bash
node scripts/db-inspect.mjs
node scripts/db-map.mjs
```

---

## Variáveis relacionadas ao banco

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente browser (respeita RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | escritas server-side (bypassa RLS) |
| `POSTGRES_URL_NON_POOLING` | conexão direta (porta 5432) usada pelo runner de migrations |
| `POSTGRES_URL` | conexão via pooler (porta 6543) — para runtime/consultas |
| `SUPABASE_PRODUCTS_BUCKET` | nome do bucket privado (padrão `products`) |
