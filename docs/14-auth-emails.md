# 14. Auth emails — domínio próprio (Zoho)

Os e-mails de confirmação de conta **não saem do Next.js**. O Supabase Auth envia. Sem SMTP customizado, o remetente é `noreply@mail.app.supabase.io` e o rodapé diz “powered by Supabase”.

Use o **mesmo Zoho** dos formulários do site para o remetente ser **Couto Software House** no domínio `couto.software`.

## 1. SMTP no Supabase

**Authentication → Emails → SMTP Settings** (ou Project Settings → Authentication → SMTP)

| Campo | Valor |
|-------|--------|
| Enable custom SMTP | on |
| Sender name | `Couto Software House` |
| Sender email | `support@couto.software` (ou o alias que o Zoho autoriza) |
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
| Redirect URLs | `https://couto.software/auth/callback` e `http://localhost:3000/auth/callback` |

Sem isso, o botão “Confirm” do e-mail falha depois do SMTP estar certo.

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

Não apague `{{ .ConfirmationURL }}` — é o link assinado do Auth.

## 4. Como validar

1. Salve SMTP + templates.
2. Crie uma conta nova (ou reenvie a confirmação).
3. O From deve ser `Couto Software House <support@couto.software>` (ou o sender que você configurou).
4. Sem “powered by Supabase” no rodapé.
5. O botão abre `/auth/callback` e entra no dashboard.

E-mails de **contato e newsletter** já saem pelo Zoho (`src/lib/email.ts`). E-mails de **compra** também. Só o Auth precisava deste SMTP no painel.
