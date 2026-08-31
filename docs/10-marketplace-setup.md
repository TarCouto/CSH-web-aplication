# 10. Marketplace — setup inicial

Guia conciso para configurar a camada base do marketplace de boilerplates.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Onde obter | Observação |
|----------|------------|------------|
| `NEXT_PUBLIC_APP_URL` | URL do app | Sem barra final; usada nos redirects do Stripe |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Público |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API | Público; respeita RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API | **Somente servidor**; bypassa RLS |
| `SUPABASE_PRODUCTS_BUCKET` | Nome do bucket | Padrão: `products` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys | Público |
| `STRIPE_SECRET_KEY` | Stripe → API keys | **Somente servidor** |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI ou Dashboard webhooks | Assinatura de eventos |
| `DOWNLOAD_LIMIT` | Opcional | Padrão: `5` downloads por compra |

## Migrations

Runner versionado do projeto (recomendado) — aplica os arquivos de `supabase/migrations/` em ordem e registra em `schema_migrations`:

```bash
npm run db:migrate
```

Alternativas:
- [Supabase CLI](https://supabase.com/docs/guides/cli) linkado: `supabase db push`
- **SQL Editor** no dashboard: cole e execute na ordem `0001_init.sql` → `0002_storage.sql`

Detalhes completos do schema, RLS e workflow de migrations em [12 — Banco de dados (DBA)](./12-database.md).

## Bucket de storage

O bucket `products` é **privado** (`public = false`). Arquivos `.zip` dos boilerplates ficam lá; o browser nunca acessa o bucket diretamente. URLs assinadas são geradas no servidor via `createServiceClient()` (service role).

## Como as peças se conectam

```
Browser → Supabase anon client (RLS)     → produtos publicados, perfil, pedidos próprios
API routes / Server Actions              → orquestram fluxo de checkout e download
createServiceClient()                    → grava pedidos, entitlements, URLs assinadas
getStripe()                              → Checkout Sessions, webhooks, produtos/preços
src/server/                              → lógica de negócio portável (sem imports Next)
```

Fluxo resumido: usuário autentica via Supabase Auth → vê produtos `published` → paga via Stripe Checkout → webhook confirma pagamento e cria `order` + `entitlement` (service role) → download gera URL assinada e incrementa `download_count`.
