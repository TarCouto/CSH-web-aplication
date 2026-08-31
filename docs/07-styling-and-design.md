# 7. Estilos e design

## Tailwind CSS v4

**Entry point:** `src/styles/tailwind.css`

```css
@import 'tailwindcss';
@theme { /* custom tokens */ }
```

### Design tokens customizados

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-sans` | Mona Sans | Texto geral |
| `--font-display` | Mona Sans (width 125%) | Títulos |
| `--text-xs` … `--text-7xl` | Escala tipográfica | Tamanhos de fonte |
| `--radius-4xl` | Border radius grande | Cards, inputs, imagens |

---

## Fontes

**Arquivo:** `src/styles/base.css`

```css
@font-face {
  font-family: 'Mona Sans';
  src: url('../fonts/Mona-Sans.var.woff2') format('woff2');
  font-weight: 200 900;
  font-stretch: 75% 125%;
}
```

Fonte variável **Mona Sans** — usada para sans e display.

---

## Tipografia MDX

**Arquivo:** `src/styles/typography.css`

Classe `.typography` aplicada automaticamente ao conteúdo MDX via `remark-rehype-wrap`.

Estilos para:
- Headings (h1–h4) com `font-display`
- Parágrafos, listas, links
- Tabelas responsivas
- Code blocks (Shiki vars, fundo `neutral-950`, radius `4xl`)
- Figures e imagens

---

## Paleta de cores

| Cor | Uso principal |
|-----|---------------|
| `neutral-950` | Texto principal, botões, header |
| `neutral-600` | Texto secundário |
| `neutral-300` | Bordas, inputs |
| `neutral-50` / `white` | Fundos claros |
| `neutral-700` | Texto footer |

Sem cores de accent customizadas — paleta neutra monocromática.

---

## Padrões visuais

| Padrão | Classes típicas |
|--------|-----------------|
| Títulos | `font-display text-4xl font-medium` |
| Eyebrows | `font-display text-base font-semibold` |
| Cards | `rounded-4xl bg-white ring-1 ring-neutral-950/5` |
| Botões primários | `bg-neutral-950 text-white rounded-full` |
| Botões invertidos | `bg-white text-neutral-950` (variante `invert`) |
| Inputs | `rounded-2xl border border-neutral-300` |
| Seções escuras | `bg-neutral-950 text-white` (ContactSection) |

---

## PostCSS

**Arquivo:** `postcss.config.js`

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

---

## Prettier

**Arquivo:** `prettier.config.js`

- Plugin `prettier-plugin-tailwindcss` — ordena classes automaticamente
- Stylesheet apontando para `tailwind.css`

---

## Componentes visuais especiais

| Componente | Efeito |
|------------|--------|
| `GridPattern` | Padrão SVG decorativo de fundo |
| `GrayscaleTransitionImage` | Imagem P&B → colorida no hover |
| `StylizedImage` | Imagem com moldura/skew |
| `Logo` | Fill animado no hover |

---

## Responsividade

Breakpoints Tailwind padrão:
- `sm:` — 640px
- `md:` — 768px
- `lg:` — 1024px
- `xl:` — 1280px

Layout típico:
- Mobile: coluna única
- `lg:`: grid 2 colunas (contact, footer, about)
- `sm:`: grid 2-3 colunas para stats e lists

---

## Header / navegação

- Header fixo com fundo transparente → overlay escuro no scroll
- Menu hamburger expande para fullscreen `neutral-950`
- Logo + links + offices + social no menu expandido
