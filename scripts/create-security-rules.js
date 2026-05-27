const fs = require('fs');

const content = [
  '---',
  'description: Regras de segurança para rotas administrativas do Granel da Praca',
  'globs: ["src/app/admin/**/*"]',
  'alwaysApply: false',
  '---',
  '',
  '# Admin Security - Granel da Praca',
  '',
  '## Middleware obrigatorio',
  '- Toda rota /admin/* verificar sessao antes de qualquer query',
  '- Redirecionar para /conta/login se nao autenticado',
  '- Verificar role = admin em app_users - nunca confiar apenas em cookie',
  '- Usar middleware.ts do Next.js com matcher /admin/:path*',
  '',
  '## Logs de acesso',
  '- Acesso a /admin/* sem autenticacao - log com IP e timestamp',
  '- Erros 401/403 em qualquer rota - log estruturado',
  '- getSupabaseAdmin() em rotas admin - confirmar que esta atras de verificacao de role',
  '',
  '## Checklist antes de criar qualquer rota /admin',
  '- middleware.ts tem matcher cobrindo a rota',
  '- Server Action verifica role = admin antes de qualquer operacao',
  '- Nenhuma rota admin importada em Client Component',
  '- getSupabaseAdmin() usado apenas apos verificacao de role',
].join('\n');

fs.writeFileSync('.cursor/rules/granel-admin-security.mdc', content, 'utf8');
console.log('OK');
