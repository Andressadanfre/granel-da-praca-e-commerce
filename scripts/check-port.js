// Verifica se a porta 3000 já está em uso antes do dev subir.
// Se estiver, avisa e encerra o processo automaticamente (só o(s)
// PID(s) da porta 3000 — não mexe em outros processos Node do sistema).
const { execSync } = require('child_process')

const PORT = 3000

function checkAndFreePort() {
  try {
    const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf-8' })
    const lines = result.trim().split('\n')
    const pids = new Set()

    for (const line of lines) {
      const match = line.trim().match(/LISTENING\s+(\d+)$/)
      if (match) pids.add(match[1])
    }

    if (pids.size === 0) {
      console.log(`✓ Porta ${PORT} livre.`)
      return
    }

    console.log(`⚠ Porta ${PORT} ocupada por PID(s): ${[...pids].join(', ')}. Encerrando...`)
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf-8' })
        console.log(`  → PID ${pid} encerrado.`)
      } catch {
        console.log(`  → PID ${pid} já não existia.`)
      }
    }
  } catch {
    // findstr não encontrou nada = porta já está livre
    console.log(`✓ Porta ${PORT} livre.`)
  }
}

checkAndFreePort()
