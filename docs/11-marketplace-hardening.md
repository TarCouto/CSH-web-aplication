# 11. Marketplace — hardening

Camada de proteção operacional: rate limiting, confirmação de compra por e-mail, EULA e resumo de segurança no download.

## Rate limiting (downloads)

A rota `GET /api/download/[productId]` aplica um limitador **in-memory de janela fixa** antes de qualquer trabalho pesado (entitlement, storage, watermark).

| Parâmetro | Valor |
|-----------|-------|
| Chave | `download:{userId}` |
| Limite | 10 requisições |
| Janela | 60 segundos |
| Resposta ao exceder | `429 Too Many Requests` + header `Retry-After` (segundos) |

Implementação: `src/lib/rate-limit.ts`.

### Limitação em produção

O store é um `Map` em memória no processo Node. Em ambientes **serverless** ou **multi-instância**, cada instância mantém contadores separados — proteção best-effort, não garantida globalmente.

**Recomendação para produção:** migrar para [Upstash Redis](https://upstash.com/) ou Redis com `@upstash/ratelimit` (ou equivalente) compartilhado entre todas as instâncias.

## EULA

Página pública em **`/eula`** (`src/app/eula/page.tsx`).

Cobre: concessão de licença (comprador único, não exclusiva, intransferível), uso permitido (projetos próprios e de clientes), proibições (redistribuição, revenda, compartilhamento de código-fonte, repos públicos), propriedade intelectual, cópias rastreáveis com watermark, isenção de garantia, limitação de responsabilidade e contato.

## E-mail de confirmação de compra

Disparado em `fulfillCheckoutSession` (`src/server/services/orders.ts`) **após** o upsert de `entitlements` bem-sucedido.

| Campo | Origem |
|-------|--------|
| Destinatário | `session.customer_details.email` (Stripe Checkout) |
| Assunto | `Your purchase: {productName}` |
| Corpo | `buildPurchaseEmailHtml` em `src/lib/email.ts` |
| Link | `{NEXT_PUBLIC_APP_URL}/dashboard` |

O envio está em `try/catch` próprio: falha de SMTP **não** interrompe o fulfillment (pedido + entitlement já persistidos). Erros são logados com `console.error`.

`sendEmail` aceita `to` opcional; rotas de contact/newsletter continuam usando os endereços internos (`ZOHO_EMAIL_TO`).

## Segurança do download (recap)

Fluxo completo em `GET /api/download/[productId]`:

1. **Autenticação** — Supabase Auth; sem sessão → redirect para login.
2. **Rate limit** — por usuário, janela de 60s (ver acima).
3. **Entitlement** — RLS + consulta; sem acesso → `403`.
4. **Limite de downloads** — `download_count >= download_limit` → `403`.
5. **Storage** — bucket privado via service role; sem `storage_path` → `404`.
6. **Watermark** — `LICENSE.txt` com fingerprint rastreável (`buildFingerprint` em `src/server/services/delivery.ts`).
7. **Auditoria** — registro em `downloads` + incremento de `download_count`.

## Códigos de status — `/api/download/[productId]`

| Status | Condição | Corpo / comportamento |
|--------|----------|------------------------|
| **302** | Usuário não autenticado | Redirect para `/login?redirect=/dashboard` |
| **403** | Sem entitlement | `You do not have access to this product.` |
| **403** | Limite de downloads atingido | `Download limit reached` |
| **429** | Rate limit excedido | `Too many download requests. Please wait a moment.` + `Retry-After` |
| **404** | Produto sem arquivo no storage | `Product not available for download.` |
| **500** | Erro interno (storage, DB, etc.) | `Download failed. Please try again later.` |
| **200** | Sucesso | Arquivo `.zip` com `Content-Disposition: attachment` |

## Variáveis de ambiente relevantes

| Variável | Uso nesta camada |
|----------|-----------------|
| `NEXT_PUBLIC_APP_URL` | URL do dashboard no e-mail de confirmação |
| `DOWNLOAD_LIMIT` | Limite por entitlement (padrão: `5`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Download via service client |
| `SUPABASE_PRODUCTS_BUCKET` | Bucket privado dos `.zip` |
| `ZOHO_SMTP_HOST` / `ZOHO_SMTP_PORT` | SMTP para e-mail de confirmação |
| `ZOHO_SMTP_USER` / `ZOHO_SMTP_PASSWORD` | Credenciais SMTP |
| `ZOHO_EMAIL_FROM` | Remetente (fallback: `ZOHO_SMTP_USER`) |
| `ZOHO_EMAIL_TO` | Destino padrão de contact/newsletter (não usado na confirmação de compra) |

## Testes

| Arquivo | Escopo |
|---------|--------|
| `src/lib/rate-limit.test.ts` | Janela fixa, bloqueio no N+1, chaves independentes |
| `src/server/services/delivery.test.ts` | `buildFingerprint` determinístico (sem rede/Supabase) |

Executar (requer loader TypeScript, ex.: `tsx`):

```bash
npm test
```

Validação mínima de tipos:

```bash
npx tsc --noEmit
```
