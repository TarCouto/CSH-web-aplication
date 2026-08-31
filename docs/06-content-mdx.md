# 6. Conteúdo MDX

O site usa **MDX** para blog e case studies — conteúdo rico com componentes React embutidos.

---

## Convenção de arquivos

```
src/app/{blog|work}/{slug}/page.mdx
```

Cada pasta contém:
- `page.mdx` — conteúdo + metadata
- Imagens locais (`.jpg`, `.png`) referenciadas no MDX

---

## Metadata exportada

Cada arquivo MDX exporta dois objetos:

### Blog — `article`

```typescript
export const article: Article = {
  date: '2024-03-15',
  title: 'Article Title',
  description: 'Short description for listings',
  author: {
    name: 'Author Name',
    role: 'Role',
    image: { src: authorImage, alt: '...' },  // optional
  },
}
```

### Work — `caseStudy`

```typescript
export const caseStudy: CaseStudy = {
  date: '2023-01',
  client: 'Client Name',
  title: 'Case Study Title',
  description: 'Short description',
  summary: ['Point 1', 'Point 2', 'Point 3'],
  logo: logoImage,
  image: { src: heroImage, alt: '...' },
  service: 'Service Category',
  testimonial: {
    author: { name: '...', role: '...' },
    content: 'Quote text',
  },
}
```

### SEO — `metadata`

```typescript
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Meta description',
}
```

---

## Tipos TypeScript

Definidos em `src/lib/mdx.ts`:

```typescript
interface Article {
  date: string
  title: string
  description: string
  author: { name: string; role: string; image?: ImageProps }
}

interface CaseStudy {
  date: string
  client: string
  title: string
  description: string
  summary: string[]
  logo: ImageProps['src']
  image: ImageProps
  service: string
  testimonial: { author: { name: string; role: string }; content: string }
}
```

---

## Content loader

**Arquivo:** `src/lib/mdx.ts`

| Função | Retorno | Ordenação |
|--------|---------|-----------|
| `loadArticles()` | `MDXEntry<Article>[]` | Por data (desc) |
| `loadCaseStudies()` | `MDXEntry<CaseStudy>[]` | Por data (desc) |

Descobre arquivos via `fast-glob('**/page.mdx')` e importa metadata dinamicamente.

Cada entry inclui:
- Todos os campos do tipo (`Article` ou `CaseStudy`)
- `href` — URL da página (ex: `/blog/future-of-web-development`)
- `metadata` — referência ao objeto original

---

## Pipeline MDX

Configurado em `next.config.mjs`:

| Plugin | Função |
|--------|--------|
| `remark-gfm` | GitHub Flavored Markdown (tabelas, strikethrough) |
| `unified-conditional` + `remarkMDXLayout` | Injeta wrapper por diretório |
| `recma-import-images` | Import de imagens em MDX |
| `@leafac/rehype-shiki` | Syntax highlighting (tema `css-variables`) |
| `rehype-unwrap-images` | Desembrulha imagens do `<p>` |
| `remark-rehype-wrap` | Envolve conteúdo em `<Typography>` |

### Wrappers injetados

| Diretório | Wrapper | Prop exportada |
|-----------|---------|----------------|
| `src/app/blog/` | `@/app/blog/wrapper.tsx` | `article` |
| `src/app/work/` | `@/app/work/wrapper.tsx` | `caseStudy` |

---

## Componentes disponíveis no MDX

Registrados em `mdx-components.tsx` + `MDXComponents.tsx`:

```mdx
<StatList>
  <StatListItem value="98%" label="Performance score" />
</StatList>

<TagList>
  <TagListItem>React</TagListItem>
  <TagListItem>Next.js</TagListItem>
</TagList>

<Blockquote author={{ name: 'Name', role: 'Role' }}>
  Quote text here.
</Blockquote>

<TopTip>
  Important tip or callout.
</TopTip>
```

Imagens inline são convertidas para `StylizedImage` automaticamente.

Code blocks recebem syntax highlighting via Shiki.

---

## Como adicionar novo conteúdo

### Novo artigo de blog

1. Criar pasta: `src/app/blog/{slug}/page.mdx`
2. Exportar `article` e `metadata`
3. Escrever conteúdo MDX
4. Adicionar imagens na mesma pasta
5. **Adicionar URL em `src/app/sitemap.ts`**

### Novo case study

1. Criar pasta: `src/app/work/{slug}/page.mdx`
2. Exportar `caseStudy` e `metadata`
3. Escrever conteúdo MDX
4. Adicionar imagens na mesma pasta
5. **Adicionar URL em `src/app/sitemap.ts`**

---

## Conteúdo atual

### Blog (3 artigos)

| Slug | Título | Tema |
|------|--------|------|
| `future-of-web-development` | Why Web Performance Directly Impacts Your Revenue | Performance, Core Web Vitals |
| `3-lessons-we-learned-going-back-to-the-office` | How to Choose the Right Frontend Framework | React vs Next.js vs Angular |
| `a-short-guide-to-component-naming` | The True Cost of Technical Debt | Dívida técnica |

### Work (3 case studies)

| Slug | Client | Tema |
|------|--------|------|
| `performance-seo` | Performance & SEO | Web Performance, Lighthouse |
| `scalability-architecture` | Scalability & Architecture | Arquitetura, SSR, ISR |
| `design-system-ux` | Design System & UX | Design systems, UX |

> **Nota:** slugs de pasta são legados do template Tailwind Plus. O conteúdo foi reescrito para CSH.
