import sharp from 'sharp'
import { mkdirSync } from 'fs'
import path from 'path'

const SRC = 'public/images/images'
const DIFERENCIAIS_OUT = 'public/images/diferenciais'
const OBJETIVOS_OUT = 'public/images/objetivos'

// DiferenciaisSection — cards grandes, imagem 600x400
const DIFERENCIAIS_MAP = {
  'banner-entrega-no-mesmo-dia.png': 'entrega-no-mesmo-dia.webp',
  'banner-qualidade-garantida.png': 'qualidade-garantida.webp',
  'banner-estilo-de-vida.png': 'estilo-de-vida.webp',
}

// CompreObjetivoSection — círculo pequeno, imagem 200x200
const OBJETIVOS_MAP = {
  'banner-antioxidantes.png': 'antioxidantes.webp',
  'banner-fibras.png': 'fibras.webp',
  'banner-energia.png': 'energia.webp',
  'banner-proteinas.png': 'proteinas.webp',
  'banner-imunidade.png': 'imunidade.webp',
  'banner-veganos.png': 'veganos.webp',
}

mkdirSync(DIFERENCIAIS_OUT, { recursive: true })
mkdirSync(OBJETIVOS_OUT, { recursive: true })

for (const [src, out] of Object.entries(DIFERENCIAIS_MAP)) {
  await sharp(path.join(SRC, src))
    .resize(600, 400, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(path.join(DIFERENCIAIS_OUT, out))
  console.log('✓ diferenciais/' + out)
}

for (const [src, out] of Object.entries(OBJETIVOS_MAP)) {
  await sharp(path.join(SRC, src))
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(path.join(OBJETIVOS_OUT, out))
  console.log('✓ objetivos/' + out)
}

console.log('Concluído — 9 arquivos otimizados.')
