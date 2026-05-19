import { rmSync, existsSync } from 'fs'
import { execSync } from 'child_process'

const nextDir = new URL('../.next', import.meta.url).pathname.slice(1)

if (existsSync(nextDir)) {
  console.log('🗑️  Limpando .next...')
  rmSync(nextDir, { recursive: true, force: true })
  console.log('✅ .next removido')
}

console.log('🔨 Iniciando build...')
execSync('next build', { stdio: 'inherit' })
