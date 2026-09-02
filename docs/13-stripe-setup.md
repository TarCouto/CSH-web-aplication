# 13. Stripe — arquitetura e organização financeira

Guia para configurar a conta Stripe de forma organizada e conectá-la ao marketplace. Público-alvo do negócio: **agências de comunicação europeias (B2B, porte médio)** — isso influencia moeda, impostos (VAT) e métodos de pagamento.

> **Aviso:** as partes de imposto (VAT/OSS) são orientação prática de configuração, **não** aconselhamento contábil/fiscal. Confirme o enquadramento com seu contador.

---

## 1. Como o código usa o Stripe (contrato)

| Peça | Arquivo | Comportamento |
|------|---------|---------------|
| Cliente Stripe | `src/lib/stripe.ts` | singleton, API version `2026-08-26.dahlia` |
| Checkout | `src/server/services/checkout.ts` | `mode: 'payment'`, usa `product.stripe_price_id`, `metadata { userId, productId }` |
| Rota checkout | `src/app/api/checkout/route.ts` | exige login, só produto `published` |
| Webhook | `src/app/api/stripe/webhook/route.ts` + `orders.ts` | fulfillment + sync de catálogo |

**Regras que a arquitetura impõe:**
1. Pagamento **único** por produto (não é assinatura).
2. Todo produto comprável **tem** um `stripe_price_id`.
3. Vínculo Stripe → Supabase por `stripe_product_id` e `stripe_price_id`.
4. Comprador identificado por `metadata.userId` / `metadata.productId` (setados no checkout).

---

## 2. Test mode vs Live mode

Trabalhe **sempre em Test mode primeiro** (toggle no topo do dashboard). As chaves e webhooks são **separados** por modo.

- **Test:** chaves `pk_test_...` / `sk_test_...`, cartões de teste (`4242 4242 4242 4242`).
- **Live:** chaves `pk_live_...` / `sk_live_...`, só depois de validar o fluxo ponta a ponta.

Você vai ter **dois conjuntos** de env vars ao longo do tempo. Comece com as de teste.

---

## 3. Estrutura de Products & Prices (a "organização financeira")

Filosofia: **Stripe é a fonte da verdade de preço/pagamento; Supabase guarda o conteúdo de marketing e o status.**

### Recomendação
- **1 Product no Stripe por boilerplate.** Nome claro (ex.: "SaaS Starter — Next.js + Stripe").
- **1 Price (one-time) por Product.** Moeda **EUR** (público europeu).
- Marque o Price como **tax behavior: inclusive ou exclusive** (ver seção VAT). Para B2B europeu, o comum é **exclusive** (imposto somado por cima).
- Use **metadata no Product do Stripe** para o `slug` (ex.: `slug = saas-starter`) — ajuda a rastrear, embora o vínculo principal seja por ID.

### Moeda
Recomendado **EUR**. O `price.currency` é copiado para `products.currency` pelo webhook, então o catálogo exibe a moeda do Price. (Multi-moeda é possível depois com Prices adicionais.)

### Não use
- Preços recorrentes/assinatura (nosso `mode` é `payment`).
- Vários Prices ativos no mesmo Product sem critério (confunde o sync — mantenha 1 preço ativo por produto).

---

## 4. Fluxo recomendado para cadastrar um produto

Como o webhook `product.created`/`price.created` **cria um rascunho** no Supabase automaticamente, o fluxo limpo é:

```
1. Stripe (Test): cria Product + Price (EUR)
        │  webhook product.created / price.created
        ▼
2. Supabase: surge uma linha em products com status='draft',
   já com stripe_product_id, stripe_price_id, price_cents, currency
        │
        ▼
3. Você enriquece a linha (SQL/seed): slug, tagline, description,
   features, tech_stack, cover_image, storage_path (caminho do .zip)
        │
        ▼
4. status = 'published'  → aparece em /products e fica comprável
```

Alternativa (sem depender do webhook para criar): `npm run db:seed` aplica `supabase/seeds/0001_meterkit.sql` (upsert do slug `meterkit` + Price de Test). Útil em dev. Em Live, use o `prod_` / `price_` de Live.

---

## 5. Webhook

Endpoint da aplicação: **`/api/stripe/webhook`**

- **Produção:** `https://couto.software/api/stripe/webhook`
- **Local (dev):** use o Stripe CLI para encaminhar eventos.

### Eventos a assinar
| Evento | Efeito no app |
|--------|---------------|
| `checkout.session.completed` | cria `order` (paid) + `entitlement` |
| `product.created` | cria produto `draft` no Supabase |
| `product.updated` | atualiza nome/descrição/capa |
| `price.created` | atualiza preço/moeda/`stripe_price_id` |
| `price.updated` | idem |

### Signing secret
Cada endpoint de webhook gera um **signing secret** (`whsec_...`) → vai na env `STRIPE_WEBHOOK_SECRET`. **Test e Live têm secrets diferentes.**

### Dev local com Stripe CLI
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
O `stripe listen` imprime um `whsec_...` temporário — use no `.env.local`.

---

## 6. Impostos (VAT) — importante para público europeu

Vender **produto digital** para a UE tem regras de VAT:
- **B2C (consumidor):** cobra-se o VAT do país do comprador.
- **B2B com VAT ID válido:** normalmente **reverse charge** (0% cobrado, comprador declara).

### Configuração recomendada
1. Ative o **Stripe Tax** (Dashboard → More → Tax). Ele calcula o VAT automaticamente por país.
2. Ative **coleta de Tax ID** no Checkout (para agências B2B informarem o VAT number → aplica reverse charge).
3. Defina o **tax behavior** dos Prices (inclusive/exclusive) de forma consistente.
4. Registre-se onde for obrigado (ex.: **VAT OSS** para vendas B2C intra-UE) — confirme com contador.

> **Nota de implementação:** o Checkout envia `invoice_creation`, `tax_id_collection` e `billing_address_collection`. **`automatic_tax` está desligado** — a conta Stripe é BR e o Stripe Tax ainda não é suportado nesse país; ligar o flag faz `checkout.sessions.create` falhar. Quando o Tax existir para BR, volte o flag e adicione registrations. Enquanto isso, VAT na UE é assunto de contador (Non-Union OSS), não do Stripe.

---

## 7. Métodos de pagamento

Para agências europeias, além de cartão, considere habilitar (Dashboard → Settings → Payment methods):
- **Cards** (sempre)
- **SEPA Direct Debit** (comum em B2B na UE)
- **iDEAL** (Holanda), **Bancontact** (Bélgica), **Klarna** (opcional)

O Checkout mostra automaticamente os métodos elegíveis por país/moeda. Não precisa mudar código (usamos Stripe Checkout hospedado).

---

## 8. Branding e experiência do Checkout

- **Settings → Branding:** logo, cor, ícone. Aparece no Checkout hospedado e nos recibos.
- **Statement descriptor:** como aparece na fatura do cartão (ex.: `COUTO SOFTWARE`).
- **Customer emails:** ative **Successful payments** e e-mails de **invoice**. O Checkout gera fatura (`invoice_creation`); o Stripe envia o PDF. O e-mail Zoho continua só como “seu produto está no dashboard”.

---

## 9. Payouts (recebimento)

- **Settings → Business / Bank accounts:** cadastre a conta bancária que recebe os repasses.
- **Payout schedule:** diário/semanal/mensal (padrão costuma ser automático).
- Complete o **onboarding/verificação** da conta (KYC) antes de ir para Live.

---

## 10. Env vars do Stripe (onde vão)

Adicione no `.env.local` (dev) e na **Vercel** (produção). Comece com as de **teste**.

| Variável | Valor (test) | Onde obter |
|----------|--------------|------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Developers → API keys |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Developers → API keys (**server only**) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Developers → Webhooks (endpoint) ou `stripe listen` |

Ao ir para produção, crie o endpoint de webhook **em Live**, pegue o `whsec_` de Live e troque as chaves por `pk_live_`/`sk_live_` na Vercel.

---

## 11. Checklist de setup

- [ ] Conta Stripe criada e em **Test mode**
- [ ] Branding (logo/cor) + statement descriptor
- [ ] Métodos de pagamento (Cards + SEPA/iDEAL/Bancontact conforme público)
- [ ] 1º Product + Price (EUR, one-time) em Test
- [ ] Webhook Test apontando para `/api/stripe/webhook` com os 5 eventos
- [ ] `pk_test`, `sk_test`, `whsec` no `.env.local`
- [ ] Stripe Tax ligado (Test) + Prices com tax behavior
- [ ] Customer emails: Successful payments + invoices
- [ ] Fluxo testado: checkout pede endereço e VAT ID → fatura Stripe + e-mail Zoho → download
- [ ] Onboarding/KYC + conta bancária para payouts
- [ ] Repetir chaves/webhook em **Live** e configurar na Vercel

---

## 12. Resumo em uma frase

> No Stripe: **1 Product + 1 Price (EUR, one-time) por boilerplate**, webhook em `/api/stripe/webhook` com os eventos de checkout e de product/price, chaves de **test primeiro**; o Stripe cuida de preço/pagamento/VAT e o Supabase do conteúdo e do status — comece em Test e só depois replique em Live.
