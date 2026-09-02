# 14. Auth emails — domínio próprio (Zoho)

Os e-mails de confirmação de conta **não saem do Next.js**. O Supabase Auth envia. Sem SMTP customizado, o remetente é `noreply@mail.app.supabase.io` e o rodapé diz “powered by Supabase”.

Use o **mesmo Zoho** dos formulários do site para o remetente ser **Couto Software House** no domínio `couto.software`.

## 1. SMTP no Supabase

**Authentication → Emails → SMTP Settings** (ou Project Settings → Authentication → SMTP)

| Campo | Valor |
|-------|--------|
| Enable custom SMTP | on |
| Sender name | `Couto Software House` |
| Sender email | `support@couto.software` (ou o alias que o Zoho autorizar) |
| Host | `smtp.zoho.com` |
| Port | `465` |
| Username | o mesmo `ZOHO_SMTP_USER` do `.env.local` |
| Password | a senha de app Zoho (mesmo `ZOHO_SMTP_PASSWORD`) |
| Minimum interval | 60s (recomendado) |

Se o Zoho recusar o `From`, use o próprio usuário SMTP como sender (ex.: `tarcisio@couto.software`) até criar o alias `support@`.

Não cole a senha neste repositório. Use a que já está no `.env.local`.

## 2. URLs de redirect

**Authentication → URL Configuration**

| Campo | Valor |
|-------|--------|
| Site URL | `https://couto.software` |
| Redirect URLs | `https://couto.software/**` e `http://localhost:3000/**` |

O wildcard cobre `/auth/confirm` (confirmação por OTP) e `/auth/callback` (OAuth / PKCE same-browser).

## 3. Templates

**Authentication → Email Templates**

Cole o HTML de `supabase/templates/`:

| Template no painel | Arquivo |
|--------------------|---------|
| Confirm signup | `supabase/templates/confirm-signup.html` |
| Magic Link | `supabase/templates/magic-link.html` |
| Reset password | `supabase/templates/reset-password.html` |

Subject sugerido:

- Confirm signup: `Confirm your Couto Software House account`
- Magic link: `Sign in to Couto Software House`
- Reset password: `Reset your Couto Software House password`

### Formato dos links (OTP — funciona em qualquer navegador)

**Não use** `{{ .ConfirmationURL }}` nos templates de e-mail. Esse URL termina em `/auth/callback?code=...` e depende do cookie PKCE do navegador em que o usuário se cadastrou — falha ao abrir o link no webmail, celular ou Outlook SafeLinks.

Use `{{ .SiteURL }}` + `{{ .TokenHash }}` apontando para `/auth/confirm`:

| Template | Link |
|----------|------|
| Confirm signup | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/signup/confirmed` |
| Magic link | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard` |
| Reset password | `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/dashboard/profile` |

A rota `src/app/auth/confirm/route.ts` chama `verifyOtp({ type, token_hash })` e redireciona conforme `next`:

| Resultado | Destino (signup) | Destino (outros fluxos) |
|-----------|------------------|------------------------|
| Sucesso | `/signup/confirmed` — instruções + botão de login | valor de `next` (ex.: `/dashboard`) |
| Falha | `/signup/confirm-failed` — aviso + tentar cadastro de novo | `/login?error=confirm_failed` |

`/auth/callback` permanece para OAuth (Google, etc.) e fluxos PKCE no mesmo browser.

## 4. Como validar

1. Salve SMTP + templates no painel Supabase (Authentication → Emails).
2. Confirme Site URL e Redirect URLs (secção 2).
3. Crie uma conta nova em um navegador.
4. Abra o e-mail de confirmação e clique no link **em outro navegador ou dispositivo** (simula webmail).
5. Deve abrir `/signup/confirmed` com instruções de primeiro login — conta confirmada.
6. Link já usado ou expirado → `/signup/confirm-failed` (cadastro) ou `/login?error=confirm_failed` (magic link).
7. O From deve ser `Couto Software House <support@couto.software>` (ou o sender configurado), sem “powered by Supabase”.

E-mails de **contato e newsletter** já saem pelo Zoho (`src/lib/email.ts`). E-mails de **compra** também. Só o Auth precisava deste SMTP no painel.
