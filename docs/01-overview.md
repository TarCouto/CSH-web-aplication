# 1. Visão geral

## O que é esta aplicação

Site institucional/marketing da **Couto Software House** — empresa brasileira de engenharia de software especializada em aplicações web de alta performance.

Baseado no template comercial **Tailwind Plus Studio**, customizado com conteúdo, branding e integrações da CSH.

| Campo | Valor |
|-------|-------|
| Nome do pacote | `tailwind-plus-studio` |
| Versão | `0.1.0` |
| Domínio | `https://couto.software` |
| Idioma do site | Inglês (`lang="en"`) |

---

## Stack tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Runtime | Node.js | 22.x |
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.4 |
| Linguagem | TypeScript | 5.8+ |
| Estilos | Tailwind CSS | 4.2.2 |
| Conteúdo | MDX | 3.x |
| Email | Nodemailer + Zoho SMTP | 9.x |
| Syntax highlight | Shiki | 0.11.x |
| Animações | Framer Motion | 12.x *(instalado, não usado)* |

---

## Scripts npm

```bash
npm run dev      # Servidor de desenvolvimento (webpack)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint (next/core-web-vitals)
```

---

## Dependências principais

### Runtime

- **next**, **react**, **react-dom** — core do framework
- **tailwindcss**, **@tailwindcss/postcss** — estilos utility-first
- **@next/mdx**, **@mdx-js/***, **remark-gfm**, **rehype-***, **shiki** — pipeline de conteúdo MDX
- **nodemailer** — envio de email via SMTP
- **fast-glob** — descoberta de arquivos MDX
- **clsx** — composição de classes CSS

### Dev

- **eslint**, **eslint-config-next** — linting
- **prettier**, **prettier-plugin-tailwindcss** — formatação
- **sharp** — otimização de imagens
- **@types/nodemailer**, **@types/react**, **@types/node** — tipos TypeScript

---

## Path alias

```json
"@/*": ["./src/*"]
```

Exemplo: `import { Button } from '@/components/Button'`

---

## Arquivos de configuração na raiz

| Arquivo | Propósito |
|---------|-----------|
| `next.config.mjs` | MDX pipeline, security headers, page extensions |
| `tsconfig.json` | TypeScript strict, path alias |
| `postcss.config.js` | Plugin Tailwind PostCSS v4 |
| `prettier.config.js` | Formatação + ordenação de classes Tailwind |
| `.eslintrc.json` | ESLint Next.js core-web-vitals |
| `mdx-components.tsx` | Registro global de componentes MDX |
| `.env.example` | Template de variáveis de ambiente |
| `.env.local` | Credenciais locais *(gitignored)* |

---

## Licença do template

O template base **Tailwind Plus Studio** é produto comercial licenciado pela [Tailwind Plus](https://tailwindcss.com/plus/license). O código customizado da CSH é propriedade do projeto.
