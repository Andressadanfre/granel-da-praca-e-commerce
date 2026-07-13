# Runbook — Backup semanal de dados (Supabase)

> Rotina manual de `pg_dump` para backup dos dados do banco de produção.
> Este documento não contém segredos — pode ser commitado normalmente.

---

## 1. Pré-requisito

- PostgreSQL 17 client tools instalado (via winget ou instalador oficial).
- Binário do `pg_dump` em: `C:\Program Files\PostgreSQL\17\bin\pg_dump.exe`
- Confirmar que o binário existe antes de rodar:

```powershell
Get-ChildItem "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" | Select-Object Name, Length, LastWriteTime
```

---

## 2. Rodar o dump (manualmente, no terminal)

Rodar o bloco inteiro de uma vez, direto no terminal — **nunca através de uma ferramenta/agente não-interativa** (`Read-Host` trava sem terminal interativo). A senha nunca aparece em texto puro nem inline no comando.

```powershell
$sec = Read-Host -AsSecureString "Senha do banco"
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
$data = Get-Date -Format "yyyyMMdd"
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -h aws-1-sa-east-1.pooler.supabase.com -p 5432 -U postgres.ymjmgukuojwumvtaglyp -d postgres --data-only -f "C:\Users\Dell\Documents\backups-granel\granel-data-$data.sql"
$exitCode = $LASTEXITCODE
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
if ($exitCode -eq 0) { "pg_dump OK" } else { "pg_dump FALHOU - exit code $exitCode" }
```

Notas de conexão:
- Session pooler, região São Paulo (`sa-east-1`), host `aws-1-sa-east-1.pooler.supabase.com`, porta **5432** — nunca a porta 6543 (transaction pooler).
- Usuário no formato `postgres.<project-id>` exigido pelo pooler.
- `--data-only`: só dados, sem schema (schema vive em `supabase/migrations/`).

---

## 3. Senha esquecida ou expirada

Resetar em: **Supabase Dashboard → Project (`ymjmgukuojwumvtaglyp`) → Database → Reset password**.

A nova senha só precisa ser digitada no prompt `Read-Host` do passo 2 — nunca salva em arquivo, script ou histórico de chat.

---

## 4. Convenção de nome do arquivo

```
granel-data-YYYYMMDD.sql
```

Exemplo: `granel-data-20260713.sql` (dump gerado em 13/07/2026). O bloco do passo 2 já gera esse nome automaticamente via `Get-Date -Format "yyyyMMdd"`.

---

## 5. Onde o arquivo fica salvo

```
C:\Users\Dell\Documents\backups-granel\
```

- **Fora do repositório** — pasta não versionada, fora de `granel-da-praca-e-commerce\`.
- **Nunca commitado.** Antes de qualquer `git add`, confirmar que nenhum `.sql` aparece em `git status --porcelain`.
- Contém PII de clientes (`app_users`, `orders`) — tratar como dado sensível, sem cópia para outros diretórios ou serviços de sincronização não autorizados.

---

## 6. Checklist de validação pós-dump

- [ ] **Tamanho > 0**
  ```powershell
  Get-ChildItem "C:\Users\Dell\Documents\backups-granel\granel-data-YYYYMMDD.sql" | Select-Object Name, Length
  ```
- [ ] **Marcador de conclusão presente** (dump não truncado)
  ```powershell
  Select-String -Path "C:\Users\Dell\Documents\backups-granel\granel-data-YYYYMMDD.sql" -Pattern "PostgreSQL database dump complete" | Select-Object -Last 1
  ```
- [ ] **Tabelas esperadas presentes** (formato `COPY`, não `INSERT` — `pg_dump` sem `--inserts` usa `COPY`)
  ```powershell
  Select-String -Path "C:\Users\Dell\Documents\backups-granel\granel-data-YYYYMMDD.sql" -Pattern "^COPY public\."
  ```
  Confirmar que `products` aparece na lista.
- [ ] **Contagem de linhas de dados em `products`** (entre o `COPY public.products (...)` e o terminador `\.` seguinte)
  ```powershell
  $allLines = (Get-Content -Raw "C:\Users\Dell\Documents\backups-granel\granel-data-YYYYMMDD.sql") -split "`r?`n"
  $start = ($allLines | Select-String "^COPY public\.products " | Select-Object -First 1).LineNumber
  $count = 0
  for ($i = $start; $i -lt $allLines.Length; $i++) {
      if ($allLines[$i] -eq '\.') { break }
      $count++
  }
  "Linhas de dados em products: $count"
  ```
- [ ] **Higiene do repo** — nenhum `.sql` no stage/working tree do projeto
  ```powershell
  git status --porcelain
  ```
