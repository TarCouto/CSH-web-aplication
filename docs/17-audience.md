# 17. Público-alvo — MeterKit

Documento de referência. Toda copy, post, precificação e decisão de canal deve bater com o que está aqui. Se uma ideia não serve a nenhum dos perfis abaixo, ela não entra.

---

## 1. Uma frase

> Quem compra o MeterKit **escreve código**. É dev indie, freelancer ou dono de estúdio de software — na Europa, com hora cara e prazo curto.

---

## 2. Os três perfis

| | Perfil | Situação | Ticket | Status |
|---|--------|----------|--------|--------|
| **P1** | Founder indie / dev solo | Construindo o próprio AI SaaS, sozinho ou em dupla | US$ 199–299 | **Núcleo — foco total agora** |
| **P2** | Dev freelancer | Cliente pediu "algo com IA" pra ontem; hora cara, prazo curto | US$ 199–299 | **Adjacente — mesma landing** |
| **P3** | Estúdio / agência **de desenvolvimento** | Precisa de licença para projetos ilimitados de clientes | US$ 599–999 | **Futuro — Agency tier, não agora** |

P1 e P2 compram com **cartão pessoal**, decisão em minutos, sem processo de compra. É por isso que a landing fala com os dois ao mesmo tempo.

P3 só entra em cena **depois das primeiras vendas orgânicas**, com depoimentos na mão. Referência de mercado: o tier Agency da Supastarter custa US$ 1.499.

---

## 3. Quem NÃO é o público

| Não é | Por quê |
|-------|---------|
| Agência de comunicação / marketing | Não tem dev interno. Não roda `docker compose up`. Não compra código-fonte. |
| Empresa média/grande com time de plataforma | Constrói internamente; compra de boilerplate não passa no processo |
| Dev iniciante procurando tutorial | Não paga US$ 249 por código que ainda não sabe editar |
| Não-técnico querendo "montar um SaaS" | Produto errado — precisa de no-code |

**Regra:** "agência" no nosso vocabulário significa **estúdio de software**. Nunca agência de marketing. Essa confusão já custou uma calibragem de estratégia — não repetir.

---

## 4. Geografia

**Foco:** Alemanha, Holanda, países nórdicos, Suíça.

Três razões: moeda forte, escassez de dev, e custo/hora alto (€60–100/h). Pra esse perfil, US$ 299 que economiza 100+ horas é decisão instantânea, não deliberação.

**Idioma de toda comunicação:** inglês. Sempre.

**Consequência operacional:** postar em horário da Europa — LinkedIn até 9h BRT.

---

## 5. A dor que o produto resolve

Todo AI SaaS precisa das mesmas quatro coisas: auth, orgs multi-tenant, integração LLM e **billing por uso**. Todo time reconstrói do zero — 100 a 300 horas, toda vez.

O diferencial defensável é o **billing por créditos**. Não dá pra só fazer `UPDATE` numa coluna de saldo: precisa de ledger append-only com reserve → settle → release. Se a chamada do LLM falha no meio do stream, o crédito volta. Se conclui, cobra tokens reais, não estimativa.

É esse o argumento que vende. Não é "mais um boilerplate".

**Diferencial secundário:** o backend NestJS vendido separado. Existem 55+ kits Next.js e quase nenhum vende o backend sozinho — quem usa Angular, Vue ou mobile fica de fora.

---

## 6. Canais

**Válidos:**

- LinkedIn — perfil **pessoal**, build in public. Company page só reposta. Headline: `Founder @ Couto Software House — building MeterKit`
- Diretórios de boilerplate
- Indie Hackers
- Reddit (r/SaaS, r/webdev)
- X
- SEO / busca orgânica

**Proibido:**

- **Cold email para a Europa.** GDPR + ePrivacy nacionais. A Alemanha, justamente o melhor mercado, é a mais dura — B2B frio sem consentimento pode gerar advertência formal com custo. E a matemática não fecha: cold email converte em ticket de milhares, não de centenas.
- Lista comprada, disparo em massa
- Funil pago (não é o modelo escolhido)

**Outbound aceitável:** warm outreach cirúrgico — responder thread de dev europeu reclamando de billing/IA, DM contextual. Um a um.

---

## 7. Consequências práticas

| Decisão | Puxada por |
|---------|-----------|
| Preço US$ 199–299 one-time | P1/P2 compram sozinhos, sem aprovação de compras |
| Compra com cartão pessoal | Ninguém vai pedir fatura com dados fiscais → **CPF atende esta fase** |
| CNPJ vira necessário | Quando o Agency tier (P3) entrar em cena |
| Copy em inglês, tom técnico | Comprador lê docs antes de pagar |
| Docs públicas | Comprador técnico decide lendo arquitetura |
| Statement descriptor `COUTOSOFTWARE` | Comprador estrangeiro precisa reconhecer na fatura |

---

## 8. Ordem que não se inverte

1. Produto + landing `/meterkit` no ar
2. Primeiras vendas orgânicas de P1/P2
3. Depoimentos
4. **Aí sim** — ofensiva Agency tier (P3) na Europa

Pular pro passo 4 antes do 2 é vender ticket alto sem prova social. Não funciona.

---

## 9. Relação com o site (para agentes)

| Precisa de | Doc |
|------------|-----|
| Checkout, webhook, download | [16 — Pagamentos](./16-payments.md) |
| Stripe, Tax, branding, statement descriptor | [13 — Stripe setup](./13-stripe-setup.md) |
| Rotas e páginas | [03 — Rotas](./03-routes-and-pages.md) |

Copy de produto, landing `/meterkit`, e-mails de compra e posts **não** podem falar com agência de marketing nem com comprador não-técnico. Inglês sempre.
