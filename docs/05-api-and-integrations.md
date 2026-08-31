# 5. API e integrações

## API Routes

### POST `/api/contact`

**Arquivo:** `src/app/api/contact/route.ts`

Formulário de contato da página `/contact`.

#### Request

```json
{
  "name": "string (required)",
  "email": "string (required)",
  "company": "string (optional)",
  "phone": "string (optional)",
  "message": "string (required)",
  "budget": "string (optional)"
}
```

#### Budget values

| Value | Label exibido no email |
|-------|------------------------|
| `1` | $1K – $5K |
| `5` | $5K – $10K |
| `10` | $10K – $25K |
| `25` | $25K – $50K |
| `50` | $50K – $100K |
| `100` | More than $100K |

#### Responses

| Status | Body | Condição |
|--------|------|----------|
| `200` | `{ "success": true }` | Email enviado |
| `400` | `{ "error": "Name, email and message are required" }` | Campos obrigatórios faltando |
| `500` | `{ "error": "Failed to send message" }` | Erro SMTP ou config |

#### Email gerado

- **Subject:** `New lead from {name} at {company}`
- **Reply-To:** email do visitante
- **Template:** `buildContactEmailHtml()` em `lib/email.ts`

---

### POST `/api/newsletter`

**Arquivo:** `src/app/api/newsletter/route.ts`

Formulário de newsletter do footer.

#### Request

```json
{
  "email": "string (required)"
}
```

#### Responses

| Status | Body | Condição |
|--------|------|----------|
| `200` | `{ "success": true }` | Email enviado |
| `400` | `{ "error": "Email is required" }` | Email vazio |
| `400` | `{ "error": "Invalid email address" }` | Formato inválido |
| `500` | `{ "error": "Failed to subscribe" }` | Erro SMTP ou config |

#### Email gerado

- **Subject:** `Newsletter subscription: {email}`
- **Reply-To:** email do inscrito
- **Template:** `buildNewsletterEmailHtml()` em `lib/email.ts`

---

## Serviço de email

**Arquivo:** `src/lib/email.ts`

### Funções exportadas

| Função | Propósito |
|--------|-----------|
| `sendEmail({ subject, html, replyTo? })` | Envia email via Nodemailer |
| `buildContactEmailHtml({...})` | Template HTML do formulário de contato |
| `buildNewsletterEmailHtml({ email })` | Template HTML da newsletter |

### Configuração SMTP

| Variável | Default | Obrigatória |
|----------|---------|-------------|
| `ZOHO_SMTP_HOST` | `smtp.zoho.com` | Não |
| `ZOHO_SMTP_PORT` | `465` | Não |
| `ZOHO_SMTP_USER` | — | **Sim** |
| `ZOHO_SMTP_PASSWORD` | — | **Sim** |
| `ZOHO_EMAIL_FROM` | `ZOHO_SMTP_USER` | Não |
| `ZOHO_EMAIL_TO` | `tarcisio@couto.software` | Não |

### Segurança

- HTML escapado via `escapeHtml()` para prevenir injection
- Senhas nunca expostas no client
- API routes rodam server-side only

---

## Integrações externas

| Integração | Tipo | Onde | Propósito |
|------------|------|------|-----------|
| **Zoho Mail SMTP** | Email transacional | `lib/email.ts` | Notificações de formulários |
| **Google Search Console** | SEO | `layout.tsx` | Verificação de propriedade |
| **Schema.org JSON-LD** | SEO estruturado | `layout.tsx`, wrappers | Organization, Article, Service |
| **LinkedIn** | Social | `SocialMedia.tsx` | Link externo |
| **GitHub** | Social | `SocialMedia.tsx` | Link externo |
| **Vercel** | Deploy/hosting | — | Produção em `couto.software` |

---

## Diagrama de fluxo — formulários

```
┌──────────────┐     ┌──────────────┐
│ ContactForm  │     │NewsletterForm│
│  (client)    │     │   (client)   │
└──────┬───────┘     └──────┬───────┘
       │ POST               │ POST
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│/api/contact  │     │/api/newsletter│
│  (server)    │     │   (server)   │
└──────┬───────┘     └──────┬───────┘
       │                    │
       └────────┬───────────┘
                ▼
         ┌─────────────┐
         │ lib/email.ts│
         │  sendEmail()│
         └──────┬──────┘
                ▼
         ┌─────────────┐
         │ Zoho SMTP   │
         │ (Nodemailer)│
         └──────┬──────┘
                ▼
         ┌─────────────┐
         │ ZOHO_EMAIL_TO│
         │ (inbox)     │
         └─────────────┘
```

---

## Integração removida

| Serviço | Status | Notas |
|---------|--------|-------|
| **Resend** | Removido | Substituído por Zoho SMTP. Remover `RESEND_API_KEY` da Vercel se ainda existir. |
