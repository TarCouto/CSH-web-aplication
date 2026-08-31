# 4. Componentes

Todos os componentes ficam em `src/components/`.

---

## Layout

| Componente | Arquivo | Tipo | Propósito |
|------------|---------|------|-----------|
| `RootLayout` | `RootLayout.tsx` | client | Shell: header fixo, menu fullscreen, nav, `<main>`, footer |
| `Footer` | `Footer.tsx` | server | Navegação em colunas, newsletter, logo, copyright |
| `Container` | `Container.tsx` | server | Wrapper responsivo com max-width |
| `Logo` | `Logo.tsx` | server | Marca CSH com hover fill |
| `Logomark` | `Logo.tsx` | server | Ícone da marca (sem texto) |

### RootLayout — navegação

Links do header/menu:
- `/work` — Work
- `/about` — About Us
- `/process` — Our Process
- `/blog` — Blog
- `/contact` — Contact Us

Menu inclui: `Offices`, `SocialMedia`

---

## UI (primitivos)

| Componente | Arquivo | Propósito |
|------------|---------|-----------|
| `Button` | `Button.tsx` | Link ou button estilizado (variante `invert`) |
| `Border` | `Border.tsx` | Separador com posição configurável |
| `FadeIn` | `FadeIn.tsx` | Wrapper simples *(sem animação ativa)* |
| `FadeInStagger` | `FadeIn.tsx` | Wrapper para stagger *(stub)* |
| `Blockquote` | `Blockquote.tsx` | Citação com autor |
| `List` / `ListItem` | `List.tsx` | Lista de features com título |
| `GridList` / `GridListItem` | `GridList.tsx` | Grid de cards com título |
| `StatList` / `StatListItem` | `StatList.tsx` | Estatísticas numéricas |
| `TagList` / `TagListItem` | `TagList.tsx` | Tags/chips |
| `GridPattern` | `GridPattern.tsx` | Padrão decorativo SVG |
| `StylizedImage` | `StylizedImage.tsx` | Imagem com moldura/forma |
| `GrayscaleTransitionImage` | `GrayscaleTransitionImage.tsx` | Imagem grayscale → color no hover |

---

## Feature (domínio / páginas)

| Componente | Arquivo | Tipo | Propósito |
|------------|---------|------|-----------|
| `PageIntro` | `PageIntro.tsx` | server | Hero de página (eyebrow, title, centered opcional) |
| `SectionIntro` | `SectionIntro.tsx` | server | Intro de seção com eyebrow |
| `ContactSection` | `ContactSection.tsx` | server | CTA escuro "Tell us about your project" |
| `ContactForm` | `ContactForm.tsx` | **client** | Form → `POST /api/contact` |
| `NewsletterForm` | `NewsletterForm.tsx` | **client** | Form → `POST /api/newsletter` |
| `PageLinks` | `PageLinks.tsx` | server | Links para conteúdo relacionado |
| `Testimonial` | `Testimonial.tsx` | server | Depoimento com logo do cliente |
| `Offices` | `Offices.tsx` | server | São Paulo + Remote |
| `SocialMedia` | `SocialMedia.tsx` | server | LinkedIn, GitHub |
| `JsonLd` | `JsonLd.tsx` | server | Script JSON-LD genérico |
| `MDXComponents` | `MDXComponents.tsx` | server | Mapeamento de tags MDX |

---

## ContactForm — campos

| Campo | Name | Obrigatório | Tipo |
|-------|------|-------------|------|
| Name | `name` | Sim | text |
| Email | `email` | Sim | email |
| Company | `company` | Não | text |
| Phone | `phone` | Não | tel |
| Message | `message` | Sim | text |
| Budget | `budget` | Não | radio (1, 5, 10, 25, 50, 100) |

Estados: `idle` → `sending` → `sent` | `error`

---

## NewsletterForm — campos

| Campo | Name | Obrigatório | Tipo |
|-------|------|-------------|------|
| Email | `email` | Sim | email |

Estados: `idle` → `sending` → `sent` | `error`

---

## MDXComponents — tags disponíveis no conteúdo

Registradas em `MDXComponents.tsx` e `mdx-components.tsx`:

| Tag MDX | Componente | Uso |
|---------|------------|-----|
| `Blockquote` | Citação estilizada | Depoimentos, citações |
| `StatList` / `StatListItem` | Estatísticas | Métricas em artigos |
| `TagList` / `TagListItem` | Tags | Tecnologias, categorias |
| `TopTip` | Dica destacada | Callouts informativos |
| `Typography` | Wrapper tipográfico | Conteúdo longo (auto-injetado) |
| `img` → `StylizedImage` | Imagem estilizada | Fotos em artigos |
| Tabelas | Responsivas | GFM tables |

---

## SocialMedia — links

| Plataforma | URL |
|------------|-----|
| LinkedIn | Configurado em `SocialMedia.tsx` |
| GitHub | Configurado em `SocialMedia.tsx` |

---

## Hierarquia de uso típica

```
RootLayout
├── PageIntro / SectionIntro
├── Container
│   ├── StatList / GridList / List
│   ├── ContactForm / NewsletterForm
│   ├── PageLinks
│   └── Testimonial
├── ContactSection
└── Footer
    └── NewsletterForm
```
