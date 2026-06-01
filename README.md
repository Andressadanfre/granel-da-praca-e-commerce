# Granel da Praça — E-commerce

E-commerce de produtos naturais a granel. Uberlândia, MG.

## Stack

- Next.js 14 App Router + TypeScript strict
- Tailwind CSS v3 + Design System próprio
- Supabase (PostgreSQL + Auth + Storage) — região São Paulo
- Framer Motion, Lucide React
- Vercel (deploy)

## Pré-requisitos

- Node.js 20+
- npm

## Setup local

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Scripts úteis

```bash
npm run build
npm run build:clean
node scripts/generate-descriptions.mjs --dry-run
node scripts/generate-descriptions.mjs --limit 10
```

## Estrutura de pastas relevante
src/
app/
components/
lib/
types/
.context/
.cursor/rules/
scripts/

## Documentação completa

Notion: https://www.notion.so/33bf86ce18e5815f892fc82b14a5b870
