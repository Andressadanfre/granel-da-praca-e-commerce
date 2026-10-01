// ─── Fonte única dos dados das lojas físicas ──────────────────────────────────
// Confirmado por Andressa em 01/10/2026 (cartão CNPJ emitido na mesma data).
// Mudou endereço, telefone, horário ou corte? Editar SÓ aqui.
// Páginas legais (termos, privacidade, entrega) e public/llms.txt são texto
// corrido e repetem estes dados à mão — atualizar junto.

export const FUNDINHO = {
  endereco: 'Praça Clarimundo Carneiro, 119 – Loja 06',
  enderecoCurto: 'Pça. Clarimundo Carneiro, 119',
  bairro: 'Fundinho',
  cep: '38400-154',
  whatsapp: '5534997819292',
  whatsappDisplay: '(34) 99781-9292',
  horarioResumo: 'Seg–Sex 9h–18h · Sáb 9h–12h',
  horarios: [
    { dias: 'Segunda a sexta', horario: '9h às 18h' },
    { dias: 'Sábado', horario: '9h às 12h' },
    { dias: 'Domingos e feriados', horario: 'Fechado' },
  ],
} as const

export const UMC = {
  endereco: 'Rua Rafael Marino Neto, 600 (Complexo UMC)',
  enderecoCurto: 'R. Rafael Marino Neto, 600',
  bairro: 'Jardim Karaíba',
  whatsapp: '5534997969191',
  whatsappDisplay: '(34) 99796-9191',
  horarioResumo: 'Seg–Sex 8h–18h',
  horarios: [
    { dias: 'Segunda a sexta', horario: '8h às 18h' },
    { dias: 'Sábados, domingos e feriados', horario: 'Fechado' },
  ],
} as const

// Corte para entrega no mesmo dia. Sábado: pedido até 11h30, sai com o
// motoboy até 12h, pode chegar à tarde. Sem entrega aos domingos.
export const CORTE_ENTREGA = {
  diasUteis: { hora: 17, minuto: 0, label: '17h' },
  sabado: { hora: 11, minuto: 30, label: '11h30' },
} as const

export const RETIRADA_PRAZO = 'Retire em até 1h após a confirmação, dentro do horário da loja'
