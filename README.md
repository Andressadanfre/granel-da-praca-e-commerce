# Granel da Praça — E-commerce

E-commerce de produtos naturais a granel, extensão digital de uma rede física com duas lojas em Uberlândia, MG (desde 2019). Omnichannel por desenho: o e-commerce não substitui a loja física, estende ela.

**🔗 Demo ao vivo:** [granel-da-praca-e-commerce.vercel.app](https://granel-da-praca-e-commerce.vercel.app)

<!--
  TODO (Andressa): inserir aqui 1 screenshot ou GIF curto do fluxo
  homepage → produto → carrinho → checkout. É a primeira coisa que um
  recrutador vê — vale mais que qualquer parágrafo de descrição.
-->

## O que este projeto demonstra

Não é um CRUD de portfólio — tem dinheiro real passando por ele. Alguns pontos que valem destacar numa conversa técnica:

- **RBAC com fail-closed real:** o middleware distingue erro de infraestrutura ("indisponível") de acesso negado ("sem permissão") — a maioria dos exemplos de portfólio trata os dois casos como a mesma coisa.
- **Webhook de pagamento com verificação HMAC-SHA256** (`x-signature` do Mercado Pago) + rate limiting + idempotência via `SECURITY DEFINER` no Postgres, com proteção contra regressão de status fora de ordem.
- **Guard contra divergência de preço cliente↔servidor** (`assertTotalMatch`) — todo total é recalculado no servidor a partir do `price_cents` do banco, nunca confia no valor que o cliente envia.
- **75 testes automatizados** (Vitest) cobrindo as fórmulas de preço e a verificação de assinatura do webhook — as duas áreas onde um bug custa dinheiro de verdade, não só UX.
- **CI** (GitHub Actions) rodando lint + typecheck + testes em todo PR.
- **Observabilidade de produção real:** Sentry (client/server/edge), logging estruturado.

## Stack

- Next.js 14 App Router + TypeScript strict
- Tailwind CSS v3 + Design System próprio
- Supabase (PostgreSQL + Auth + Storage) — região São Paulo
- Mercado Pago (checkout, webhook com verificação de assinatura)
- Framer Motion, Lucide React
- Vitest (testes unitários) + Playwright (E2E)
- Sentry (observabilidade) · Upstash Redis (rate limiting)
- Vercel (deploy)

## Pré-requisitos

- Node.js 20+
- npm

## Setup local

```bash
cp .env.example .env.local
# preencher .env.local com as credenciais reais (Supabase, Mercado Pago, etc.)
npm install
npm run dev
```

## Testes

```bash
npm test              # testes unitários (Vitest)
npm run test:coverage # com relatório de cobertura
npm run test:e2e      # E2E (Playwright) — precisa do dev server rodando
```

## Scripts úteis

```bash
npm run build
npm run build:clean
npm run smoke                              # smoke test manual via Playwright
node scripts/generate-descriptions.mjs --dry-run
node scripts/generate-descriptions.mjs --limit 10
```

## Estrutura de pastas relevante

```
src/
  app/            # rotas (App Router) — loja pública, /admin, /checkout, /api
  components/     # componentes React
  lib/            # lógica de negócio, cálculos, schemas Zod, integrações
  types/
tests/e2e/        # suíte Playwright
.context/         # documentação técnica de arquitetura e design system
.cursor/rules/    # regras de padrão de código usadas no desenvolvimento assistido por IA
scripts/          # scripts utilitários (upload em massa, geração de descrições)
```

## Documentação completa

Notion: <https://www.notion.so/33bf86ce18e5815f892fc82b14a5b870>
