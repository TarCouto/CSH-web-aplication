# 9. Guia de desenvolvimento

## Setup rápido

```bash
npm install
cp .env.example .env.local
# Configurar credenciais Zoho em .env.local
npm run dev
```

---

## Convenções do projeto

### Estrutura de arquivos

| Tipo | Onde criar | Naming |
|------|-----------|--------|
| Página estática | `src/app/{rota}/page.tsx` | kebab-case |
| Conteúdo MDX | `src/app/{blog\|work}/{slug}/page.mdx` | kebab-case |
| API route | `src/app/api/{nome}/route.ts` | kebab-case |
| Componente | `src/components/{Nome}.tsx` | PascalCase |
| Utilitário | `src/lib/{nome}.ts` | camelCase |

### Imports

```typescript
// Sempre usar path alias
import { Button } from '@/components/Button'
import { sendEmail } from '@/lib/email'
import { loadArticles } from '@/lib/mdx'
```

### Componentes

- **Server components** por default (sem `'use client'`)
- Adicionar `'use client'` apenas quando necessário (state, events, hooks)
- Props tipadas com `React.ComponentPropsWithoutRef` ou interfaces dedicadas

### Metadata SEO

Toda página deve exportar `metadata`:

```typescript
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  alternates: { canonical: '/route' },
  openGraph: {
    title: 'Page Title - Couto Software House',
    description: 'Page description',
    url: '/route',
  },
}
```

---

## Como adicionar uma nova página estática

1. Criar `src/app/{rota}/page.tsx`
2. Exportar `metadata` e componente default
3. Usar `RootLayout` como wrapper
4. Compor com componentes existentes (`PageIntro`, `Container`, etc.)
5. Adicionar URL em `src/app/sitemap.ts`

```typescript
import { RootLayout } from '@/components/RootLayout'
import { PageIntro } from '@/components/PageIntro'
import { Container } from '@/components/Container'

export const metadata: Metadata = { /* ... */ }

export default function NovaPagina() {
  return (
    <RootLayout>
      <PageIntro eyebrow="..." title="..." />
      <Container className="mt-24">
        {/* conteúdo */}
      </Container>
    </RootLayout>
  )
}
```

---

## Como adicionar nova API route

1. Criar `src/app/api/{nome}/route.ts`
2. Exportar handler HTTP (`GET`, `POST`, etc.)
3. Validar input
4. Retornar `NextResponse.json()`

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // validar + processar
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '...' }, { status: 500 })
  }
}
```

---

## Como adicionar novo componente

1. Criar `src/components/{Nome}.tsx`
2. Tipar props
3. Usar classes Tailwind seguindo padrões existentes
4. Exportar como named export

```typescript
export function MeuComponente({ title }: { title: string }) {
  return (
    <div className="rounded-4xl bg-white p-8 ring-1 ring-neutral-950/5">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
    </div>
  )
}
```

---

## Como adicionar novo formulário

Seguir o padrão existente:

1. **Client component** com `'use client'` e state machine (`idle | sending | sent | error`)
2. **API route** em `src/app/api/{nome}/route.ts`
3. **Template de email** em `lib/email.ts` (nova função `build*EmailHtml`)
4. Usar `sendEmail()` existente

Referência: `ContactForm.tsx` + `/api/contact` + `buildContactEmailHtml()`

---

## Checklist para nova feature grande

- [ ] Definir rotas/páginas necessárias
- [ ] Identificar componentes reutilizáveis vs novos
- [ ] Verificar impacto em `sitemap.ts`
- [ ] Metadata SEO para novas páginas
- [ ] Variáveis de ambiente (se integração externa)
- [ ] Testar build (`npm run build`)
- [ ] Testar lint (`npm run lint`)
- [ ] Atualizar documentação em `docs/`

---

## Utilitários disponíveis

| Arquivo | Funções | Uso |
|---------|---------|-----|
| `lib/mdx.ts` | `loadArticles()`, `loadCaseStudies()` | Carregar conteúdo MDX |
| `lib/formatDate.ts` | `formatDate(dateString)` | Formatar datas en-US |
| `lib/email.ts` | `sendEmail()`, `build*EmailHtml()` | Envio de emails |

---

## Linting e formatação

```bash
npm run lint          # ESLint
npx prettier --write . # Formatar (se necessário)
```

ESLint: `next/core-web-vitals`  
Prettier: com plugin Tailwind (ordena classes)

---

## Debugging

### Formulários não enviam email

1. Verificar `.env.local` existe e tem credenciais
2. Senha com `$` → usar aspas simples no `.env.local`
3. Reiniciar `npm run dev` após alterar env
4. Verificar logs do terminal (API route errors)

### Build falha

1. Verificar imports de imagens MDX existem
2. Verificar fonte `Mona-Sans.var.woff2` em `src/fonts/`
3. Rodar `npm run build` localmente antes de push

### Página MDX não aparece na listagem

1. Verificar export `article` ou `caseStudy` no MDX
2. Verificar campo `date` está preenchido
3. Arquivo deve ser `page.mdx` dentro de subpasta

---

## Próximos passos sugeridos

Áreas identificadas para evolução:

1. **Animações** — Framer Motion instalado mas não usado; `FadeIn` é stub
2. **Sitemap dinâmico** — gerar URLs MDX automaticamente em vez de manual
3. **Newsletter** — atualmente só notifica por email; sem lista de inscritos persistida
4. **i18n** — site em inglês; sem suporte multilíngue
5. **Testes** — sem testes automatizados configurados
