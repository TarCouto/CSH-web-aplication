# 3. Rotas e páginas

## Páginas estáticas

Todas usam `RootLayout` como shell (header + footer).

| Rota | Arquivo | Title (SEO) | Propósito |
|------|---------|-------------|-----------|
| `/` | `src/app/page.tsx` | *(default root)* | Home: hero, stats, case studies, testimonial, serviços, CTA |
| `/about` | `src/app/about/page.tsx` | About Us | Sobre a empresa, cultura, estatísticas |
| `/contact` | `src/app/contact/page.tsx` | Contact Us | Formulário + offices, emails, social |
| `/process` | `src/app/process/page.tsx` | Our Process | Processo Discover/Build/Deliver |
| `/blog` | `src/app/blog/page.tsx` | Blog | Listagem de artigos MDX |
| `/work` | `src/app/work/page.tsx` | Our Work | Listagem de case studies MDX |
| *(404)* | `src/app/not-found.tsx` | — | Página não encontrada |

### Conta (auth)

| Rota | Arquivo | Title | Propósito |
|------|---------|-------|-----------|
| `/login` | `src/app/login/page.tsx` | Log in | Login de conta |
| `/signup` | `src/app/signup/page.tsx` | Sign up | Cadastro |
| `/signup/confirmed` | `src/app/signup/confirmed/page.tsx` | Email confirmed | Sucesso pós-confirmação de e-mail |
| `/signup/confirm-failed` | `src/app/signup/confirm-failed/page.tsx` | Confirmation failed | Erro na confirmação — tentar cadastro de novo |

---

## Home (`/`)

**Arquivo:** `src/app/page.tsx`

Seções:
1. **Hero** — título principal + CTA
2. **Stats** — métricas (4+ anos, 50+ projetos, 98% satisfação)
3. **Case studies** — 3 cards linkando para `/work/{slug}`
4. **Testimonial** — depoimento de cliente
5. **Services** — SPAs, Landing Pages, Dashboards
6. **ContactSection** — CTA escuro "Tell us about your project"

---

## About (`/about`)

**Arquivo:** `src/app/about/page.tsx`

Seções:
1. **PageIntro** — "Performance-driven, people-first"
2. **Cultura** — texto sobre a empresa
3. **StatList** — estatísticas
4. **PageLinks** — links para artigos do blog

---

## Contact (`/contact`)

**Arquivo:** `src/app/contact/page.tsx`

Layout em grid 2 colunas:
- **ContactForm** — formulário de contato (client component)
- **ContactDetails** — offices, emails (`hello@`, `careers@`), social

---

## Process (`/process`)

**Arquivo:** `src/app/process/page.tsx`

Seções:
1. **PageIntro** — processo de trabalho
2. **Discover / Build / Deliver** — 3 fases com List
3. **GridList** — valores (Performance-first, Transparent communication, etc.)

---

## Blog — listagem (`/blog`)

**Arquivo:** `src/app/blog/page.tsx`

- Carrega artigos via `loadArticles()` de `lib/mdx.ts`
- Ordenados por data (mais recente primeiro)
- Cada card linka para `/blog/{slug}`

### Artigos MDX

| Rota | Slug (pasta) | Title | Data |
|------|--------------|-------|------|
| `/blog/future-of-web-development` | `future-of-web-development` | Why Web Performance Directly Impacts Your Revenue | 2024-03-15 |
| `/blog/3-lessons-we-learned-going-back-to-the-office` | `3-lessons-we-learned-going-back-to-the-office` | How to Choose the Right Frontend Framework | 2024-01-22 |
| `/blog/a-short-guide-to-component-naming` | `a-short-guide-to-component-naming` | The True Cost of Technical Debt | 2023-10-08 |

**Wrapper:** `src/app/blog/wrapper.tsx`
- JSON-LD `Article`
- Header com título, data, autor
- Conteúdo MDX via `Typography`
- Links para 2 artigos relacionados
- `ContactSection`

---

## Work — listagem (`/work`)

**Arquivo:** `src/app/work/page.tsx`

- Carrega case studies via `loadCaseStudies()` de `lib/mdx.ts`
- Ordenados por data

### Case studies MDX

| Rota | Slug (pasta) | Client | Service | Data |
|------|--------------|--------|---------|------|
| `/work/performance-seo` | `performance-seo` | Performance & SEO | Web Performance | 2023-01 |
| `/work/scalability-architecture` | `scalability-architecture` | Scalability & Architecture | Application Architecture | 2022-10 |
| `/work/design-system-ux` | `design-system-ux` | Design System & UX | Design System & Frontend | 2022-06 |

**Wrapper:** `src/app/work/wrapper.tsx`
- JSON-LD `Service`
- `PageIntro` + metadados (client, year, service)
- Hero image (`GrayscaleTransitionImage`)
- Conteúdo MDX
- Links para 2 case studies relacionados
- `ContactSection`

---

## Metadata routes

| Rota | Arquivo | Propósito |
|------|---------|-----------|
| `/sitemap.xml` | `src/app/sitemap.ts` | Sitemap estático (todas URLs públicas) |
| `/robots.txt` | `src/app/robots.ts` | Allow all + link sitemap |

> **Importante:** ao adicionar nova página MDX, incluir a URL em `sitemap.ts`.

---

## Layout raiz

**Arquivo:** `src/app/layout.tsx`

Configurações globais:
- `metadataBase`: `https://couto.software`
- Title template: `%s - Couto Software House`
- OpenGraph + Twitter cards
- Google Search Console verification
- JSON-LD `Organization` (founder: Tarcisio Couto)
- Import `@/styles/tailwind.css`
