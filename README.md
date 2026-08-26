# Granel da Praça — E-commerce

E-commerce de produtos naturais a granel, extensão digital de uma rede física com duas lojas em Uberlândia, MG (desde 2019). Omnichannel por desenho: o e-commerce não substitui a loja física, estende ela.

**Demo ao vivo:** [granel-da-praca-e-commerce.vercel.app](https://granel-da-praca-e-commerce.vercel.app)

<!--
TODO (Andressa): inserir aqui 1 screenshot ou GIF curto do fluxo
homepage → produto → carrinho → checkout. É a primeira coisa que um
recrutador vê — vale mais que qualquer parágrafo de descrição.
-->

## Contexto de negócio

Este projeto não nasceu como exercício de portfólio: é a extensão digital de um negócio físico real, e também o objeto de estudo do meu MBA em Gestão de Negócios Digitais e IA (USP/Esalq), sobre transformação digital de PME varejista com IA.

- 402 SKUs ativos organizados em base de dados unificada (Supabase), sincronizados com a operação física
- Decisão estratégica deliberada: manter loja física e e-commerce como um único negócio omnichannel, não dois canais concorrentes
- Estratégia de aquisição em construção em paralelo: Google Ads e um agente de atendimento via WhatsApp orientado por IA, com foco em reduzir CAC e construir dados first-party

## Minha função no projeto

Lidero a estratégia de produto e as decisões de negócio — o que construir, em que ordem e por quê — como fundadora do negócio físico que este e-commerce estende. Desenvolvi sozinha o design system e a experiência de UX/UI do produto (tokens visuais, componentes, arquitetura de interface). Uso IA generativa (Cursor, Claude) como parceira de execução para traduzir essas decisões de negócio e design em produto funcional com qualidade de produção — testes automatizados, segurança e observabilidade — sem depender de um time técnico dedicado.

## O que este projeto demonstra

Não é um CRUD de portfólio — tem dinheiro real passando por ele. Alguns pontos que valem destacar numa conversa técnica:

- **RBAC com fail-closed real:** o middleware distingue erro de infraestrutura ("indisponível") de acesso negado ("sem permissão") — a maioria dos exemplos de portfólio trata os dois casos como a mesma coisa.
- **Webhook de pagamento com verificação HMAC-SHA256** (`x-signature` do Mercado Pago) + rate limiting + idempotência via `SECURITY DEFINER` no Postgres, com proteção contra regressão de status fora de ordem.
- **Guard contra divergência de preço cliente↔servidor** (`assertTotalMatch`) — todo total é recalculado no servidor a partir do `price_cents` do banco, nunca confia no valor que o cliente envia.
- **75 testes automatizados** (Vitest) cobrindo as fórmulas de preço e a verificação de assinatura do webhook — as duas áreas onde um bug custa dinheiro de verdade, não só UX.
- **CI** (GitHub Actions) rodando lint + typecheck + testes em todo PR.
- **Observabilidade de produção real:** Sentry (client/server/edge), logging estruturado.
- **Auditoria de segurança contínua, feita por mim:** identifiquei e corrigi falhas reais de limite de tentativas de login e de exposição de função crítica de pagamento — documentado como parte do processo, não só do resultado.

## Stack

- Next.js 14 App Router + TypeScript strict
- Tailwind CSS v3 + Design System próprio
- Supabase (PostgreSQL + Auth + Storage) — região São Paulo
- Mercado Pago (checkout, webhook com verificação de assinatura)
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
npm test # testes unitários (Vitest)
npm run test:coverage # com relatório de cobertura
npm run test:e2e # E2E (Playwright) — precisa do dev server rodando
```

## Scripts úteis

```bash
npm run build
npm run build:clean
npm run smoke # smoke test manual via Playwright
node scripts/generate-descriptions.mjs --dry-run
node scripts/generate-descriptions.mjs --limit 10
```

## Estrutura de pastas relevante

```
src/
  app/           # rotas (App Router) — loja pública, /admin, /checkout, /api
  components/    # componentes React
  lib/           # lógica de negócio, cálculos, schemas Zod, integrações
  types/
tests/e2e/       # suíte Playwright
.context/        # documentação técnica de arquitetura e design system
.cursor/rules/   # regras de padrão de código usadas no desenvolvimento assistido por IA
scripts/         # scripts utilitários (upload em massa, geração de descrições)
```

## Documentação completa

Notion: <https://www.notion.so/33bf86ce18e5815f892fc82b14a5b870>

## Sobre

Projeto desenvolvido por Andressa Dantas, fundadora da Granel da Praça e estudante de MBA em Gestão de Negócios Digitais e IA (USP/Esalq). Estratégia de produto, UX/UI e dados aplicados a varejo físico, com IA generativa como parceira de execução — do design ao produto em produção.

Uberlândia, MG · LinkedIn: [linkedin.com/in/andressa-dantas-314156275](https://www.linkedin.com/in/andressa-dantas-314156275)
