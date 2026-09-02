# Plano de Correções — Instruções para o Agente Orquestrador

> **Documento de execução.** Gerado a partir de uma auditoria completa do projeto (backend, frontend, banco, config) em 2026-09-02.
> **Público-alvo:** um agente orquestrador que vai disparar múltiplos agentes de codificação em paralelo.
> **Regra de ouro:** cada tarefa lista os arquivos exatos, o problema, a correção esperada e o critério de aceite. O agente executor NÃO deve re-auditar o projeto — apenas implementar o que está descrito.

---

## Como orquestrar

- Os workstreams **A–F são independentes entre si** e podem rodar em agentes paralelos, **exceto** onde marcado `DEPENDE DE`.
- Dentro de cada workstream, as tarefas são sequenciais (ordem listada).
- Cada agente deve rodar `npx tsc --noEmit` e `npm run lint` antes de reportar conclusão.
- **Não fazer commit automático.** Cada agente entrega working tree; o humano revisa.
- Convenções do projeto: TypeScript estrito, serviços com injeção de dependência em `src/server/services/`, rotas de API finas em `src/app/api/`, migrações SQL numeradas em `supabase/migrations/` (a próxima é `0004_...`), docs em PT-BR, código/comentários em EN.

### Ordem de prioridade dos workstreams

| Workstream | Tema | Prioridade | Paralelizável |
|---|---|---|---|
| A | Segurança crítica (app) | 🔴 P0 | Sim |
| B | Banco de dados (migração + RPC) | 🔴 P0 | Sim |
| C | Robustez de pagamento/webhook | 🔴 P0 | Depois de B (usa RPC) |
| D | Rate limiting + validação de entrada | 🟠 P1 | Sim |
| E | Testes + CI | 🟠 P1 | Depois de A–C (testa o código novo) |
| F | Frontend: template residual, SEO, a11y | 🟡 P2 | Sim |

---

## Workstream A — Segurança crítica (app)

### A1. Open redirect no callback de auth
- **Arquivo:** `src/app/auth/callback/route.ts` (linha ~8 e ~15)
- **Problema:** o parâmetro `next` da query string é usado direto em `NextResponse.redirect(`${origin}${next}`)`. `?next=//evil.com` redireciona para fora do site.
- **Correção:** aplicar `safeRedirectPath()` de `src/lib/auth.ts` (já existe, já rejeita `//`) ao valor de `next` antes do redirect — mesmo padrão já usado em `src/lib/supabase/middleware.ts:52`.
- **Aceite:** `?next=//evil.com`, `?next=https://evil.com` e `?next=/\evil.com` caem no fallback (`/dashboard` ou `/`); `?next=/dashboard/library` funciona.

### A1b. Confirmação de e-mail quebrada (BUG EM PRODUÇÃO — prioridade máxima do workstream)
- **Arquivos:** novo `src/app/auth/confirm/route.ts`; `src/app/auth/callback/route.ts`; `supabase/templates/confirm-signup.html`; `docs/14-auth-emails.md`
- **Problema:** o e-mail de confirmação usa `{{ .ConfirmationURL }}`, que termina em `/auth/callback?code=...` → `exchangeCodeForSession(code)`. O fluxo PKCE exige o cookie `code-verifier` gravado no navegador do cadastro; ao abrir o link em outro navegador/dispositivo (caso típico: webmail, celular) a troca falha → `/login?error=auth_callback_error`. Agravante: o SafeLinks do Outlook/Hotmail pré-visita o link e consome o token de uso único.
- **Correção (padrão oficial Supabase):**
  1. Criar rota `GET src/app/auth/confirm/route.ts`: lê `token_hash`, `type` e `next` (sanitizado com `safeRedirectPath`) da query; chama `supabase.auth.verifyOtp({ type, token_hash })` com o client de `src/lib/supabase/server.ts`; sucesso → redirect para `next` (default `/dashboard`); falha → `/login?error=confirm_failed` com `console.error` do motivo.
  2. Atualizar `supabase/templates/confirm-signup.html`: trocar as DUAS ocorrências de `{{ .ConfirmationURL }}` por `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`. Fazer o mesmo em `magic-link.html` (`type=email`) e `reset-password.html` (`type=recovery`, `next=/dashboard/profile` ou página de nova senha, conforme fluxo existente).
  3. Manter `/auth/callback` como está (continua servindo OAuth/PKCE same-browser), apenas com o fix A1.
  4. Atualizar `docs/14-auth-emails.md` documentando o novo formato de link.
- **Ação humana necessária (registrar no relatório final):** colar os templates atualizados no dashboard do Supabase (Authentication → Emails) e, em Authentication → URL Configuration, definir Site URL = `https://couto.software` e adicionar à allowlist de Redirect URLs: `https://couto.software/**` e `http://localhost:3000/**`.
- **Aceite:** cadastro em um navegador + clique no link de confirmação em OUTRO navegador → conta confirmada e sessão criada; link já usado/expirado → `/login?error=confirm_failed` (não mais `auth_callback_error` genérico).

### A2. Cookies de sessão sem flags de segurança
- **Arquivo:** `src/lib/auth.ts` (linhas 3–7, `sessionCookieOptions`)
- **Problema:** faltam `secure` e `httpOnly`.
- **Correção:** adicionar `httpOnly: true` e `secure: process.env.NODE_ENV === 'production'`. Verificar que as opções são consumidas em `src/lib/supabase/server.ts`, `client.ts` e `middleware.ts` sem quebrar o client browser (o client de browser NÃO pode receber `httpOnly` — se necessário, separar as opções em duas constantes: uma para servidor, outra para browser).
- **Aceite:** login continua funcionando em dev; cookies em produção saem com `Secure; HttpOnly; SameSite=Lax`.

### A3. Misconfiguração falha aberta
- **Arquivos:** `src/lib/supabase/middleware.ts` (linhas ~20–22), `src/lib/env.ts` (linhas ~9 e ~30)
- **Problema:** (1) sem env vars do Supabase, o middleware pula autenticação silenciosamente; (2) `appUrl` cai para `http://localhost:3000` em produção se `NEXT_PUBLIC_APP_URL` faltar (quebra `success_url` do Stripe); (3) `DOWNLOAD_LIMIT` malformado vira `NaN` = downloads ilimitados.
- **Correção:** (1) em produção (`NODE_ENV === 'production'`), lançar erro claro se Supabase não estiver configurado em vez de retornar early; (2) em produção, lançar erro se `NEXT_PUBLIC_APP_URL` não estiver definido; (3) validar `Number(...)` com `Number.isFinite` e fallback para `5`.
- **Aceite:** dev sem env continua rodando o site institucional; build de produção sem envs obrigatórias falha com mensagem explícita; `DOWNLOAD_LIMIT=abc` resulta em limite 5.

### A4. Service-role desnecessário
- **Arquivos:** `src/app/api/checkout/route.ts` (linha ~43), `src/app/api/billing/portal/route.ts` (linha ~33)
- **Problema:** usam `createServiceClient()` (bypass total de RLS) só para ler/escrever o perfil do próprio usuário — operação já permitida pelas policies `profiles_select_own`/`profiles_update_own`.
- **Correção:** trocar pelo client RLS do usuário (`createClient()` de `src/lib/supabase/server.ts`). **Atenção:** após B1, a escrita de `stripe_customer_id` passa a ser bloqueada pela policy — nesse caso a escrita do customer id (feita em `src/server/services/billing.ts`) DEVE continuar via service client; só as leituras migram para o client RLS.
- **Aceite:** checkout e billing portal continuam funcionando ponta a ponta.

### A5. Middleware rodando no webhook
- **Arquivo:** `src/middleware.ts` (matcher, linhas ~10–12)
- **Problema:** `supabase.auth.getUser()` (chamada de rede) roda em `/api/stripe/webhook`, `/api/contact` e `/api/newsletter` sem necessidade.
- **Correção:** excluir do matcher pelo menos `/api/stripe/webhook` (idealmente também `/api/contact` e `/api/newsletter`).
- **Aceite:** webhook não passa mais pelo middleware; rotas de dashboard continuam protegidas.

---

## Workstream B — Banco de dados

> Criar UMA migração nova: `supabase/migrations/0004_hardening.sql`. Idempotente quando possível. Rodar via `npm run db:migrate`.

### B1. Policy `profiles_update_own` permissiva demais (VULNERABILIDADE)
- **Contexto:** `0001_init.sql:80-85` permite UPDATE em qualquer coluna da própria linha; `0003_profile_billing.sql` adicionou `stripe_customer_id` a essa tabela. Usuário pode injetar `cus_...` alheio via anon key e abrir o Billing Portal de outro cliente (`src/server/services/billing.ts:26-28` confia no valor).
- **Correção:** recriar a policy com `WITH CHECK` que impede alterar `stripe_customer_id`, `email` e `id` (comparando com os valores atuais da linha — padrão: subselect na própria tabela ou trigger `BEFORE UPDATE` que reverte colunas protegidas quando `auth.uid()` é o autor). Escritas legítimas de `stripe_customer_id` são feitas pelo service role (bypassa RLS) — não quebram.
- **Aceite:** com anon key autenticada, `update({ full_name })` funciona; `update({ stripe_customer_id: 'cus_x' })` e `update({ email: 'x@y.z' })` falham.

### B2. Contador de download atômico (VULNERABILIDADE)
- **Contexto:** `src/server/services/entitlements.ts:47-60` faz read-modify-write; requisições paralelas burlam `download_limit`.
- **Correção (SQL):** criar função RPC `increment_download_count(entitlement_id uuid) returns boolean` — `security definer`, `set search_path = public` — que executa `UPDATE entitlements SET download_count = download_count + 1 WHERE id = $1 AND download_count < download_limit RETURNING true`; retorna `false`/null se a quota estourou. Revogar execute de `anon`/`authenticated` se a chamada for só via service role (é — a rota de download usa service client).
- **Correção (TS):** em `entitlements.ts`, substituir o update por chamada `.rpc('increment_download_count', ...)`; a rota `src/app/api/download/[productId]/route.ts` deve tratar retorno `false` como 403 "limite atingido" ANTES de servir o arquivo (mover o incremento para antes do streaming, e só então servir; ver também C4).
- **Aceite:** duas requisições paralelas com `download_count = limit - 1` → exatamente uma recebe o arquivo.

### B3. Índices faltando
- **Correção (SQL), em ordem de impacto:**
  - `create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);`
  - `create index if not exists downloads_user_id_idx on public.downloads (user_id);`
  - `create index if not exists products_status_idx on public.products (status);`
  - FKs: `orders(product_id)`, `entitlements(product_id)`, `entitlements(order_id)`, `downloads(entitlement_id)`.
- **Aceite:** migração roda limpa duas vezes (idempotente).

### B4. RLS em `schema_migrations`
- **Contexto:** `scripts/migrate.mjs:32-36` cria a tabela em `public` sem RLS — legível por anon via PostgREST.
- **Correção:** `alter table public.schema_migrations enable row level security;` (sem policies = deny-all para anon; o runner usa conexão direta Postgres, não é afetado). Adicionar o mesmo `enable row level security` no bloco de criação em `scripts/migrate.mjs` para instalações novas.
- **Aceite:** anon key não lê mais a tabela; `npm run db:migrate` continua funcionando.

### B5. TLS nos scripts de banco
- **Arquivos:** `scripts/migrate.mjs` (linhas ~22–27), `scripts/db-inspect.mjs` (~15), `scripts/db-map.mjs` (~15)
- **Problema:** `ssl: { rejectUnauthorized: false }` + strip de `sslmode` = conexão de superusuário MITM-ável. Os dois scripts de inspeção também não têm o null-guard da connection string que o migrate tem.
- **Correção:** habilitar verificação de certificado (Supabase suporta; usar o CA bundle do Supabase ou `ssl: true` com `sslmode=require` respeitado). Copiar o guard de `POSTGRES_URL_NON_POOLING` ausente para os dois scripts de inspeção.
- **Aceite:** `npm run db:migrate` conecta com TLS verificado; script sem env var imprime mensagem amigável.

---

## Workstream C — Robustez de pagamento/webhook (DEPENDE DE: B2)

### C1. Webhook deve retornar 5xx em falha real
- **Arquivo:** `src/app/api/stripe/webhook/route.ts` (linhas ~55–59)
- **Problema:** qualquer erro de handler é engolido e retorna 200 → Stripe nunca retenta → cliente pago sem produto.
- **Correção:** no catch dos handlers, logar com contexto (`event.id`, `event.type`) e retornar `500` para que o Stripe retente. Manter 200 apenas para eventos ignorados/no-op esperados. Manter 400 para assinatura inválida.
- **Aceite:** simular erro no fulfillment (mock) → resposta 500; evento desconhecido → 200.

### C2. Guard de `payment_status`
- **Arquivo:** `src/server/services/orders.ts` (função `fulfillCheckoutSession`, linhas ~55–88)
- **Problema:** concede entitlement em `checkout.session.completed` mesmo com `payment_status: 'unpaid'` (métodos assíncronos); `status: 'paid'` hardcoded.
- **Correção:** retornar cedo (sem erro) se `session.payment_status !== 'paid'`; adicionar case `checkout.session.async_payment_succeeded` no switch do webhook chamando o mesmo `fulfillCheckoutSession`. Logar o skip.
- **Aceite:** sessão `unpaid` não cria order/entitlement; `async_payment_succeeded` cria.

### C3. Metadata ausente não pode ser silencioso
- **Arquivo:** `src/server/services/orders.ts` (linha ~64)
- **Problema:** `if (!userId || !productId) return` descarta uma sessão PAGA sem log.
- **Correção:** logar `console.error` com `session.id` e os campos ausentes antes do return (não lançar — não é retryable).
- **Aceite:** log presente no caminho.

### C4. Ordem das operações no download + auditoria consistente
- **Arquivo:** `src/app/api/download/[productId]/route.ts` (linhas ~99–130)
- **Problema:** insere linha de auditoria em `downloads`, depois incrementa contador — se o incremento falha, auditoria órfã; e o incremento não-atômico é o B2.
- **Correção:** nova ordem: (1) chamar a RPC atômica de B2 — se retornar quota estourada → 403; (2) baixar/entregar o arquivo; (3) inserir a linha de auditoria (falha de auditoria loga mas não falha o download). Validar `productId` como UUID no início da rota (regex simples) → 404 limpo em vez de erro de cast do Postgres. Mesmo guard de UUID em `src/app/api/checkout/route.ts`.
- **Aceite:** UUID malformado → 404/400 limpo; fluxo de download íntegro.

### C5. Tratar refund/disputa
- **Arquivos:** `src/app/api/stripe/webhook/route.ts` (switch), `src/server/services/orders.ts` (nova função)
- **Problema:** `charge.refunded` e `charge.dispute.created` não são tratados; cliente reembolsado mantém acesso eterno. `orders.status = 'refunded'` existe no schema e nunca é usado.
- **Correção:** nova função `handleRefund(stripe, supabase, charge)`: localizar o order pelo payment intent (o metadata `userId`/`productId` está em `payment_intent_data.metadata` — ver `src/server/services/checkout.ts:21-40`), marcar `orders.status = 'refunded'` e deletar (ou desativar) o entitlement correspondente. Disparar nos dois eventos.
- **Aceite:** evento de refund simulado → order `refunded`, entitlement removido, download subsequente → 403.

### C6. Erros engolidos sem log + race do customer
- **Arquivos:** `src/app/api/checkout/route.ts` (linha ~63, `catch {}` vazio), `src/server/services/billing.ts` (linhas ~20–45)
- **Correção:** (1) adicionar `console.error` em todos os catch vazios (checkout, contact, newsletter); (2) em `getOrCreateStripeCustomer`, tratar a violação de unique no update (código `23505`) fazendo re-fetch do perfil e retornando o customer id já gravado, em vez de propagar 500; usar o `existingCustomerId` já passado pelo caller em vez de re-consultar.
- **Aceite:** dois checkouts paralelos do mesmo usuário sem customer → ambos completam, um único customer usado.

---

## Workstream D — Rate limiting + validação de entrada

### D1. Rate limit persistente (substitui o in-memory)
- **Arquivo:** `src/lib/rate-limit.ts` (+ consumidores: `src/app/api/auth/login/route.ts`, `src/app/api/download/[productId]/route.ts`)
- **Problema:** `Map` local ao processo = inútil em serverless (N instâncias × limite, cold start zera) + vazamento de memória sem limite (chaves controladas pelo atacante).
- **Correção:** implementar backend Postgres via Supabase service client — tabela `rate_limits (key text primary key, count int, reset_at timestamptz)` na migração 0004 (coordenar com o agente do Workstream B — a tabela entra na MESMA migração; RLS enabled, sem policies) + função RPC atômica `check_rate_limit(p_key text, p_limit int, p_window_seconds int) returns table(allowed boolean, retry_after int)` com upsert. Manter a API pública de `rateLimit()` igual (assinatura preservada) para não tocar nos consumidores; manter a implementação in-memory como fallback para dev sem banco. Se preferir, aceitar alternativa Upstash APENAS se o humano fornecer credenciais — na ausência, Postgres.
- **Aceite:** testes existentes de `rate-limit.test.ts` adaptados continuam passando; limite sobrevive a "restart" (nova instância lê do banco).

### D2. IP confiável
- **Arquivo:** `src/app/api/auth/login/route.ts` (linhas ~8–14) e uso do IP em `src/app/api/download/[productId]/route.ts` (~99, 108)
- **Problema:** usa o primeiro (leftmost) valor de `X-Forwarded-For` — controlado pelo cliente, spoofável.
- **Correção:** extrair helper `getClientIp(request)` em `src/lib/` que prefere `x-vercel-forwarded-for`, senão o ÚLTIMO hop do `x-forwarded-for`, senão `'unknown'`. Usar no login e no log de auditoria de downloads.
- **Aceite:** header forjado com IP extra no início não muda a chave de rate limit.

### D3. Proteger `/api/contact` e `/api/newsletter`
- **Arquivos:** `src/app/api/contact/route.ts`, `src/app/api/newsletter/route.ts`
- **Problema:** sem rate limit, sem validação de tipos/tamanho; cada request dispara SMTP (flood da caixa/quota Zoho). `email` cru vai para `replyTo`.
- **Correção:** (1) aplicar `rateLimit()` por IP (ex.: 5/10min contact, 3/10min newsletter) com `Retry-After`; (2) validar: todos os campos `typeof === 'string'`, e-mail com a mesma regex já usada no newsletter, caps de tamanho (name ≤ 200, email ≤ 320, message ≤ 5000, demais ≤ 500) → 400 com mensagem genérica; (3) só usar `replyTo` se o e-mail passou na validação.
- **Aceite:** payload com `name: 123` → 400 (não 500); 6ª requisição no minuto → 429.

### D4. Endurecimento SMTP
- **Arquivo:** `src/lib/email.ts` (linhas ~22–27)
- **Correção:** adicionar `connectionTimeout: 10_000`, `greetingTimeout: 10_000`, `socketTimeout: 15_000`; adicionar `requireTLS: true` quando `port !== 465`.
- **Aceite:** SMTP inacessível → request falha em ~10s, não trava indefinidamente.

---

## Workstream E — Testes + CI (DEPENDE DE: A, B, C concluídos)

### E1. Fazer `npm test` rodar
- **Problema:** testes são `.ts`, script é `node --test`, Node local é v20 (sem type stripping), `tsx` não instalado. Suíte é decorativa.
- **Correção:** adicionar `tsx` em `devDependencies` e mudar o script para `"test": "node --import tsx --test src/**/*.test.ts"` (ou glob equivalente que funcione no Windows — validar!). Adicionar script `"typecheck": "tsc --noEmit"`.
- **Aceite:** `npm test` executa e passa os 6 testes existentes.

### E2. Testes novos (prioridade nesta ordem)
1. **`fulfillCheckoutSession`** (`src/server/services/orders.ts`) — com fakes de Supabase/Stripe (os serviços já recebem os clients por parâmetro): sessão duplicada → no-op; metadata ausente → no-op logado; `payment_status !== 'paid'` → no-op (valida C2); falha no insert de order → throw (valida C1); falha de e-mail NÃO falha o fulfillment.
2. **`safeRedirectPath`** (`src/lib/auth.ts`) — `/x` ok; `//evil.com`, `https://x`, vazio → fallback.
3. **Rate limit** — cobrir expiração de janela (avançar clock além de `resetAt`), que hoje não é testada.
4. **`escapeHtml`** (`src/lib/email.ts`) — os 5 caracteres.
- **Aceite:** `npm test` verde com os novos testes.

### E3. CI
- **Correção:** criar `.github/workflows/ci.yml`: Node 22, `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (build com envs dummy — verificar que o build passa sem secrets reais graças aos lazy getters de `src/lib/env.ts`).
- **Aceite:** workflow sintaticamente válido (`act` não é necessário; revisão manual basta).

---

## Workstream F — Frontend: template residual, SEO, acessibilidade

### F1. Remover conteúdo fake do template (CREDIBILIDADE)
- **Logos de clientes falsos em produção:**
  - `src/app/page.tsx` (~linhas 12, 189): depoimento da home usa logo **GreenLife** com `alt="CSH"` → remover o logo ou substituir por `src/images/` do logo real da CSH.
  - `src/app/work/page.tsx` (~13, 128): mesmo problema.
  - `src/app/work/*/page.mdx` (linha 1 de cada): logomarks FamilyFund/Unseal/BrightPath usados como "logo do cliente" → remover a prop `logo` ou usar o logomark da CSH.
- **Deletar assets mortos:** `src/images/team/` inteiro (12 fotos, zero referências), `src/images/clients/{bright-path,family-fund,home-work,mail-smirk}` se ficarem sem referência após o fix acima (verificar com grep antes de deletar), fotos de "autores" de depoimento (`work/*/debra-fiscal.jpg`, `emily-selman.jpg`, `jenny-wilson.jpg` — confirmar não-uso).
- **Copy do template:** reescrever o `intro` da About (`src/app/about/page.tsx:98` — boilerplate "Brand Sprints/UX Design"); trocar "design news" no `NewsletterForm.tsx:65-66` por copy de engenharia.
- **Contatos contraditórios:** `src/app/contact/page.tsx:32-33` usa `@coutosoftwarehouse.com` → padronizar para `@couto.software` (canônico, conforme EULA).
- **Stats contraditórias:** home diz 98% satisfação (`page.tsx:34`), About diz 100% (`about/page.tsx:89`) → escolher um valor único (perguntar ao humano OU usar 98% em ambos e sinalizar no relatório final).
- **Imports mortos nos MDX:** remover os imports de imagem não usados no topo de `src/app/blog/*/page.mdx` (linhas 1–3 de cada).
- **Dead code:** remover `src/components/GridPattern.tsx`, `TopTip` em `MDXComponents.tsx:68-83`, ícones não exportados em `SocialMedia.tsx`, `getDashboardNavLabel` em `DashboardNav.tsx:24-29`, e **remover `framer-motion` do `package.json`** (zero imports no projeto).
- **Aceite:** grep por `green-life|family-fund|bright-path|unseal|team/` não retorna referências em `src/app`/`src/components`; build passa.

### F2. Slugs de blog (SEO) — ⚠️ requer decisão humana
- **Problema:** os 3 diretórios de blog têm slugs do template que não descrevem o conteúdo (`3-lessons-we-learned-going-back-to-the-office` → post sobre frameworks frontend, etc.).
- **Correção:** renomear os diretórios para slugs descritivos (`choosing-frontend-framework`, `true-cost-of-technical-debt`, `web-performance-revenue`), atualizar `src/app/sitemap.ts`, e adicionar redirects 301 dos slugs antigos em `next.config.mjs` (o site está em produção — NÃO quebrar URLs).
- **Aceite:** URLs novas renderizam; antigas redirecionam 301; sitemap atualizado.

### F3. SEO técnico
- **OG image:** criar `src/app/opengraph-image.png` (ou `.tsx` com ImageResponse) 1200×630 com a marca CSH — sem isso o `twitter: summary_large_image` declarado em `layout.tsx` gera card em branco.
- **Canonical:** remover o `alternates.canonical` global de `src/app/layout.tsx:47-49` e defini-lo por página nas páginas públicas (home, about, process, work, blog, products, contact, eula).
- **Robots:** em `src/app/robots.ts`, adicionar `disallow: ['/dashboard', '/login', '/signup', '/checkout', '/api']`; adicionar `robots: { index: false }` no metadata das 5 páginas de dashboard e de `checkout/success|cancel`.
- **Sitemap:** derivar blog e work de `loadArticles()`/`loadCaseStudies()` (`src/lib/mdx.ts`) como já é feito com produtos; adicionar `/eula`.
- **Metadata faltando:** `dashboard/page.tsx`, `checkout/success`, `checkout/cancel`, `not-found.tsx`.
- **Título duplicado:** em `src/app/work/*/page.mdx` (~linha 25), remover o sufixo `— CSH` do title (o template do root já adiciona `- Couto Software House`).
- **Base URL única:** extrair `https://couto.software` (hoje triplicado em `layout.tsx:11`, `sitemap.ts:6`, `robots.ts:11`) para uma constante em `src/lib/` que lê `NEXT_PUBLIC_APP_URL` com fallback.
- **Aceite:** build passa; nenhuma página privada indexável.

### F4. Acessibilidade
- **`role="alert"`** em todas as mensagens de erro/sucesso de formulário: `ContactForm.tsx:140`, `NewsletterForm.tsx:91`, `LoginForm.tsx:89`, `SignupForm.tsx:112`, `ProfileForm.tsx:92,94`, `BillingPortalButton.tsx:37` (padrão já existe em `BuyButton.tsx:60`).
- **Campo Message → `<textarea>`:** `ContactForm.tsx:124` (hoje é `<input>` de uma linha).
- **Menu mobile:** adicionar handler de `Escape` para fechar em `RootLayout.tsx:181-250` (o `inert`/`aria-hidden` já está correto).
- **`aria-current="page"`** nos itens de navegação ativos: `RootLayout.tsx:126-142` e `DashboardNav.tsx:56-63` (o mobile já tem); adicionar `aria-label="Dashboard"` no `<nav>` desktop (`DashboardNav.tsx:51`).
- **Barra de quota de download:** `PurchasedProductsList.tsx:60-65` → `role="progressbar"` + `aria-valuenow/min/max` + texto equivalente.
- **"Limit reached" como `<span>`:** `DownloadButton.tsx:18-26` → `<button disabled>` ou texto com semântica adequada.
- **Foco pós-submit:** ao trocar o form pelo painel de sucesso (`ContactForm.tsx:84-98`, `SignupForm.tsx:75-89`), mover foco para o painel (ref + `tabIndex={-1}` + `.focus()`).
- **Aceite:** lint passa; navegação por teclado fecha o menu com Escape.

### F5. UX de carregamento
- **Correção:** criar `loading.tsx` (skeleton simples) para `src/app/products/` e `src/app/dashboard/`; criar `src/app/error.tsx` global com mensagem amigável + botão retry. Corrigir o 404: `src/app/not-found.tsx` deve envolver o conteúdo em `<RootLayout>` como todas as outras páginas.
- **Aceite:** 404 renderiza com header/footer; navegação para /products mostra skeleton.

### F6. Header estático mente sobre auth — ⚠️ decisão de arquitetura, propor não implementar sem aval
- **Problema:** páginas `force-static` (`/`, `/about`, `/process`, `/work`, `/blog`) congelam `isAuthenticated=false` no build → usuário logado vê "Log in" no header dessas páginas e "Dashboard" nas dinâmicas.
- **Correção sugerida (documentar, implementar só se o humano aprovar):** buscar o estado de auth no client dentro do `AuthSessionProvider` (via `supabase.auth.getSession()` no browser) em vez de prop do servidor, OU remover `force-static` dessas páginas. Trade-offs de cache envolvidos — registrar como pendência.

---

## Adendo pós-review (2026-09-02) — correções obrigatórias antes de commit/deploy

> Gerado após revisão humana do primeiro lote. **Não rodar `db:migrate` até o item 1 estar corrigido.**

### R1. Bloqueador — SQL inválido em `increment_download_count`
- **Arquivo:** `supabase/migrations/0004_hardening.sql`
- **Problema:** `EXISTS (UPDATE ...)` não é SQL válido no Postgres — a migração inteira faz rollback.
- **Correção:** `UPDATE ... ; RETURN FOUND;` + função irmã `decrement_download_count` para estorno de quota.
- **Aceite:** migração roda limpa; RPC retorna `true`/`false` corretamente.

### R2. Open redirect no LoginForm
- **Arquivo:** `src/components/auth/LoginForm.tsx`
- **Problema:** `router.push(redirect)` sem sanitização — mesma vuln fechada no callback.
- **Correção:** usar `safeRedirectPath(redirect)` antes do push.
- **Aceite:** `?redirect=//evil.com` cai em `/dashboard`.

### R3. Bugs de fulfillment/refund em `orders.ts`
- **Problema:** (1) checkout gratuito (`payment_status: no_payment_required`) nunca entregue; (2) retry Stripe vira no-op se order existe mas entitlement falhou; (3) refund parcial apaga acesso como se fosse total.
- **Correção:** aceitar `paid` + `no_payment_required`; se order existe sem entitlement → retry upsert; em `handleRefund`, ignorar quando `amount_refunded < amount`.
- **Aceite:** cupom 100% entrega; webhook retenta entitlement; refund parcial preserva acesso.

### R4. Quota queimada em falha de entrega
- **Arquivos:** `0004_hardening.sql` (`decrement_download_count`), `entitlements.ts`, `download/[productId]/route.ts`
- **Problema:** incremento antes da entrega consome quota se o ZIP falhar.
- **Correção:** reservar com increment → entregar → em falha (404/500) chamar `decrement_download_count`.
- **Aceite:** falha de storage não reduz downloads restantes.

### R5. TLS estrito nos scripts de banco
- **Arquivo:** `scripts/pg-config.mjs`
- **Problema:** `rejectUnauthorized: true` sem opção de CA pode impedir `npm run db:migrate` no Supabase.
- **Correção:** suportar `PGSSL_CA_FILE` (bundle customizado) e `PGSSL_REJECT_UNAUTHORIZED=false` (escape hatch documentado).
- **Aceite:** migrate conecta com TLS verificado quando CA disponível; fallback configurável.

---

## Relatório final esperado de cada agente

Cada agente deve reportar: tarefas concluídas (com arquivos tocados), tarefas puladas e por quê, resultado de `tsc --noEmit` + `lint` (+ `npm test` para o Workstream E), e pendências que exigem decisão humana (F2 redirects, F6, valor único de stats em F1).

## Fora de escopo (não fazer sem pedido explícito)

- Migrar rate limit para Upstash/Redis (D1 usa Postgres).
- Streaming do ZIP em `delivery.ts` (melhoria conhecida, adiada — buffer em memória com 3 cópias; registrar como débito técnico).
- Route groups `(marketing)`/`(shop)` para eliminar os 15 `<RootLayout>` manuais (refactor grande, adiado).
- i18n / tradução PT-BR do site.
- Tabela `stripe_events` para idempotência por event-id (o dedupe por session-id + unique constraint cobre o caso principal).
- Redesenho do dark mode (inversão de paleta é decisão de design).
