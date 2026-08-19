# Granel da Praça — E-commerce

E-commerce de produtos naturais a granel, extensão digital de uma rede física com duas lojas em Uberlândia, MG (desde 2019). Omnichannel por desenho: o e-commerce não substitui a loja física, estende ela.

**🔗 Demo ao vivo:** [granel-da-praca-e-commerce.vercel.app](https://granel-da-praca-e-commerce.vercel.app)

## O que este projeto demonstra

Não é um CRUD de portfólio — tem dinheiro real passando por ele. Pontos que valem destacar numa conversa técnica: RBAC com fail-closed real, onde o middleware distingue erro de infraestrutura de acesso negado. Webhook de pagamento com verificação HMAC-SHA256 do Mercado Pago, rate limiting e idempotência via SECURITY DEFINER no Postgres. Guard contra divergência de preço cliente-servidor, recalculando todo total no servidor a partir do price_cents do banco. 75 testes automatizados (Vitest) cobrindo as fórmulas de preço e a verificação de assinatura do webhook. CI no GitHub Actions rodando lint, typecheck e testes em todo PR. Observabilidade de produção real com Sentry (client, server e edge) e logging estruturado.

## Stack

Next.js 14 App Router com TypeScript strict, Tailwind CSS v3 com Design System próprio, Supabase (PostgreSQL, Auth e Storage, região São Paulo), Mercado Pago para checkout e webhook, Framer Motion e Lucide React, Vitest para testes unitários e Playwright para E2E, Sentry para observabilidade, Upstash Redis para rate limiting, deploy na Vercel.

## Pré-requisitos

Node.js 20 ou superior, npm.

## Setup local

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Testes

```bash
npm test
npm run test:coverage
npm run test:e2e
```

## Scripts uteis

```bash
npm run build
npm run build:clean
npm run smoke
node scripts/generate-descriptions.mjs --dry-run
```

## Estrutura de pastas relevante

```
src/app        rotas do App Router: loja publica, /admin, /checkout, /api
src/components componentes React
src/lib        logica de negocio, calculos, schemas Zod, integracoes
src/types      tipos compartilhados
tests/e2e      suite Playwright
.context       documentacao tecnica de arquitetura e design system
.cursor/rules  regras de padrao de codigo do desenvolvimento assistido por IA
scripts        scripts utilitarios
```

## Documentação completa

Notion: https://www.notion.so/33bf86ce18e5815f892fc82b14a5b870
