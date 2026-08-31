# 2. Arquitetura

## Visão de alto nível

```
┌─────────────────────────────────────────────────────────────┐
│  Root Layout (src/app/layout.tsx)                           │
│  • Metadata global, OpenGraph, JSON-LD Organization         │
│  • Import de estilos globais                                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  RootLayout (src/components/RootLayout.tsx) — client        │
│  • Header fixo com navegação overlay                        │
│  • Menu fullscreen mobile/desktop                           │
│  • <main>{children}</main>                                  │
│  • Footer com navegação + newsletter                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    Páginas estáticas   Páginas MDX      API Routes
    (page.tsx)       (page.mdx + wrapper)  (route.ts)
         │                 │                 │
         └────────┬────────┘                 │
                  │                          │
             lib/mdx.ts                 lib/email.ts
          (content loader)              (Zoho SMTP)
```

---

## App Router (Next.js 16)

A aplicação usa **App Router** com a seguinte organização:

| Tipo | Localização | Extensões |
|------|-------------|-----------|
| Páginas estáticas | `src/app/{rota}/page.tsx` | `.tsx` |
| Conteúdo MDX | `src/app/{blog\|work}/{slug}/page.mdx` | `.mdx` |
| API Routes | `src/app/api/{nome}/route.ts` | `.ts` |
| Metadata routes | `src/app/sitemap.ts`, `robots.ts` | `.ts` |
| Layout raiz | `src/app/layout.tsx` | `.tsx` |
| 404 | `src/app/not-found.tsx` | `.tsx` |

---

## Server vs Client Components

| Tipo | Onde | Exemplos |
|------|------|----------|
| **Server** (default) | Páginas, layouts, API routes | `page.tsx`, `layout.tsx`, `route.ts` |
| **Client** (`'use client'`) | Interatividade, forms, nav | `RootLayout`, `ContactForm`, `NewsletterForm` |

### Regra prática

- Páginas carregam dados no servidor (`loadArticles()`, `loadCaseStudies()`)
- Formulários e navegação interativa são client components
- API routes rodam exclusivamente no servidor

---

## Rendering strategy

A maioria das páginas exporta:

```typescript
export const dynamic = 'force-static'
```

Isso força **Static Site Generation (SSG)** no build. Exceções:

- **API routes** — sempre dinâmicas (serverless functions)
- **404** — gerada estaticamente

---

## Fluxo de conteúdo MDX

```
page.mdx
  │
  ├── export const article / caseStudy  → metadata tipada
  ├── export const metadata             → SEO Next.js
  │
  └── next.config.mjs (remarkMDXLayout)
        │
        ├── blog/ → injeta wrapper.tsx (article)
        └── work/ → injeta wrapper.tsx (caseStudy)
              │
              └── MDXComponents.tsx → Typography, Blockquote, StatList...
```

---

## Fluxo de formulários

```
ContactForm / NewsletterForm (client)
  │
  └── fetch POST → /api/contact | /api/newsletter
        │
        └── lib/email.ts
              │
              ├── getTransporter() → Nodemailer + Zoho SMTP
              ├── buildContactEmailHtml() | buildNewsletterEmailHtml()
              └── sendEmail() → ZOHO_EMAIL_TO
```

---

## SEO e structured data

| Tipo | Onde | Schema |
|------|------|--------|
| Organization | `layout.tsx` | `Organization` |
| Artigos | `blog/wrapper.tsx` | `Article` |
| Case studies | `work/wrapper.tsx` | `Service` |
| Sitemap | `sitemap.ts` | XML estático |
| Robots | `robots.ts` | Allow all |

Metadata global configurada em `src/app/layout.tsx`:
- `metadataBase`: `https://couto.software`
- Title template: `%s - Couto Software House`
- OpenGraph, Twitter cards, Google Search Console verification

---

## Security headers

Configurados em `next.config.mjs` para todas as rotas:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## Observações arquiteturais

1. **Framer Motion** está instalado mas **não é usado** — `FadeIn` é passthrough sem animação
2. **Slugs legados** do template Tailwind Plus (ex: `a-short-guide-to-component-naming`) — conteúdo reescrito para CSH
3. **Sitemap manual** — novas páginas MDX precisam ser adicionadas em `sitemap.ts`
4. **Imagens MDX** — referenciadas localmente nas pastas de cada artigo/case study
