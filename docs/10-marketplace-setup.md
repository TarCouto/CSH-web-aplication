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

## Seed do catálogo (MeterKit)

Schema **não** leva IDs de Test do Stripe. O catálogo vai em `supabase/seeds/` e corre à parte:

```bash
npm run db:seed
```

`0001_meterkit.sql` faz upsert do slug `meterkit` com o Price de Test (`price_1UBJ1vPYevgYGEkJ8gR5fZ94`). Status fica `draft` até o ZIP estar no bucket. Em Live, troca os `prod_` / `price_` no seed **antes** de rodar no banco de produção.

Placeholder de entrega (ZIP no Storage + `published`):

```bash
npm run db:seed:zip
```

## Bucket de storage

O bucket `products` é **privado** (`public = false`). Os `.zip` dos boilerplates ficam lá — **não no banco**. A tabela `products` guarda apenas o caminho (`storage_path`), nunca o binário.

O browser jamais toca o bucket. A entrega é 100% servidor: a rota de download baixa o `.zip` com o service client, injeta o `LICENSE.txt` com a marca d'água do comprador e devolve os bytes na resposta. Não existe URL assinada — nada compartilhável sai para o cliente.

### Subindo o arquivo de um produto

```bash
node scripts/upload-product.mjs --slug meterkit --file ./meterkit.zip
```

O script valida que o arquivo é um ZIP de verdade, envia para `products/<slug>/<slug>.zip`, atualiza `products.storage_path` e confere o tamanho relendo o arquivo. Use `--dry-run` para checar sem enviar.

Suba o **produto limpo**: o `LICENSE.txt` é adicionado na entrega, um por comprador. Se você incluir um `LICENSE.txt` no ZIP, ele será sobrescrito.

Acima de 50 MB o upload padrão não funciona — envie pelo dashboard do Supabase (Storage → `products`), que usa upload resumível, e depois ajuste o `storage_path` pelo SQL editor.

Requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`. Para trocar o arquivo de um produto já publicado, rode de novo: o upload usa `x-upsert`.

## Como as peças se conectam

```
Browser → Supabase anon client (RLS)     → produtos publicados, perfil, pedidos próprios
API routes / Server Actions              → orquestram fluxo de checkout e download
createServiceClient()                    → grava pedidos, entitlements, URLs assinadas
getStripe()                              → Checkout Sessions, webhooks, produtos/preços
src/server/                              → lógica de negócio portável (sem imports Next)
```

Fluxo resumido: usuário autentica via Supabase Auth → vê produtos `published` → paga via Stripe Checkout → webhook confirma pagamento e cria `order` + `entitlement` (service role) → download gera URL assinada e incrementa `download_count`.
