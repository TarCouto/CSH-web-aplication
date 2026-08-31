# 8. Ambiente e deploy

## Variáveis de ambiente

Template: `.env.example` (commitado no Git)  
Credenciais: `.env.local` (gitignored, só local)

### Variáveis Zoho SMTP

| Variável | Tipo Vercel | Obrigatória | Valor | Descrição |
|----------|-------------|-------------|-------|-----------|
| `ZOHO_SMTP_HOST` | Config | Não | `smtp.zoho.com` | Host SMTP |
| `ZOHO_SMTP_PORT` | Config | Não | `465` | Porta (465 = SSL) |
| `ZOHO_SMTP_USER` | Config | **Sim** | `tarcisio@couto.software` | Login SMTP |
| `ZOHO_SMTP_PASSWORD` | **Secret** | **Sim** | *(app password CSH)* | Senha de app Zoho |
| `ZOHO_EMAIL_FROM` | Config | Não | `support@couto.software` | Remetente visível |
| `ZOHO_EMAIL_TO` | Config | Não | `tarcisio@couto.software` | Destinatário(s) |

### Múltiplos destinatários

```env
ZOHO_EMAIL_TO=tarcisio@couto.software,support@couto.software
```

---

## Setup local

```bash
# 1. Clonar e instalar
git clone https://github.com/TarCouto/CSH-web-aplication.git
cd CSH-web-aplication
npm install

# 2. Configurar ambiente
cp .env.example .env.local
# Editar .env.local com credenciais Zoho

# 3. Rodar
npm run dev
# → http://localhost:3000
```

### Senha com caracteres especiais

No `.env.local`, use aspas simples se a senha contém `$`:

```env
ZOHO_SMTP_PASSWORD='sua-senha-aqui'
```

Na Vercel, cole **sem aspas**.

---

## Deploy na Vercel

### Configuração

| Campo | Valor |
|-------|-------|
| Framework | Next.js |
| Build command | `npm run build` |
| Output | `.next` (default) |
| Node.js | 20.x+ |
| Branch de produção | `main` |

### Checklist de deploy

1. Configurar as 6 variáveis Zoho na Vercel (Settings → Environment Variables)
2. Remover `RESEND_API_KEY` se ainda existir
3. Push para `main` → deploy automático
4. Testar formulários em produção (`/contact` + newsletter no footer)
5. Verificar email em `tarcisio@couto.software`

### Redeploy

Após alterar variáveis de ambiente, é necessário **redeploy** — a Vercel não recarrega env em deploys existentes.

---

## Build

```bash
npm run build    # Gera .next/ com SSG
npm run start    # Servidor de produção local
```

Páginas com `export const dynamic = 'force-static'` são geradas no build.

API routes são serverless functions no deploy.

---

## Domínio

| Ambiente | URL |
|----------|-----|
| Produção | `https://couto.software` |
| Vercel preview | `*.vercel.app` |

`metadataBase` configurado em `layout.tsx` como `https://couto.software`.

---

## Arquivos sensíveis (gitignore)

```
.env*.local     # Credenciais locais
/node_modules   # Dependências
/.next/         # Build output
/.vercel        # Config Vercel local
```

---

## Gerar senha de app Zoho

1. Acessar [Zoho → Security → App Passwords](https://accounts.zoho.com/home#security/app_passwords)
2. Criar senha com nome descritivo (ex: "CSH")
3. Copiar senha (só aparece uma vez)
4. Configurar em `.env.local` (local) ou Vercel (produção)
