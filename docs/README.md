# Documentação — Couto Software House (CSH)

Documentação técnica da aplicação web institucional da **Couto Software House**.

**Produção:** [https://couto.software](https://couto.software)  
**Repositório:** [TarCouto/CSH-web-aplication](https://github.com/TarCouto/CSH-web-aplication)

---

## Índice

| # | Documento | Conteúdo |
|---|-----------|----------|
| 1 | [Visão geral](./01-overview.md) | Stack, scripts, dependências, origem do projeto |
| 2 | [Arquitetura](./02-architecture.md) | Fluxo de renderização, camadas, diagramas |
| 3 | [Rotas e páginas](./03-routes-and-pages.md) | Mapa completo de URLs, metadata e conteúdo |
| 4 | [Componentes](./04-components.md) | Inventário de todos os componentes React |
| 5 | [API e integrações](./05-api-and-integrations.md) | Endpoints, formulários, Zoho Mail, SEO |
| 6 | [Conteúdo MDX](./06-content-mdx.md) | Blog, case studies, pipeline MDX |
| 7 | [Estilos e design](./07-styling-and-design.md) | Tailwind v4, tipografia, fontes |
| 8 | [Ambiente e deploy](./08-environment-and-deployment.md) | Variáveis de ambiente, Vercel, build |
| 9 | [Guia de desenvolvimento](./09-development-guide.md) | Setup local, convenções, como estender |

---

## Mapa rápido do site

```
/                    → Home
/about               → Sobre a empresa
/work                → Portfólio (listagem)
/work/{slug}         → Case study (MDX)
/blog                → Blog (listagem)
/blog/{slug}         → Artigo (MDX)
/process             → Processo de trabalho
/contact             → Contato + formulário
/api/contact         → API — formulário de contato
/api/newsletter      → API — newsletter
/sitemap.xml         → Sitemap
/robots.txt          → Robots
```

---

## Estrutura de pastas

```
src/
├── app/           # App Router (páginas, API, MDX)
├── components/    # Componentes React reutilizáveis
├── lib/           # Utilitários (email, MDX loader, datas)
├── styles/        # CSS global (Tailwind, tipografia)
├── images/        # Assets estáticos (logos de clientes)
└── fonts/         # Fonte Mona Sans
```

---

## Para novas funcionalidades

Antes de implementar uma feature grande, consulte:

1. **[Arquitetura](./02-architecture.md)** — entender onde encaixar código novo
2. **[Componentes](./04-components.md)** — reutilizar UI existente
3. **[API e integrações](./05-api-and-integrations.md)** — padrão de formulários e email
4. **[Guia de desenvolvimento](./09-development-guide.md)** — convenções do projeto
