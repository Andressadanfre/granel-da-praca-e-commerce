// Design Tokens — DS v3.1
// Fonte da verdade: Notion "📍 3 — Design System"
// Usar via className Tailwind ou style prop para valores exatos

export const tokens = {
  colors: {
    g:         '#00B207', // CTA conversão máxima
    gd:        '#2C742F', // Add-to-cart
    gdeep:     '#002603', // TopBar, preços, logo
    ghover:    '#1A5C1E', // Hover de todos os CTAs
    cream:     '#F9F5EF', // Background geral
    creamImg:  '#F0EBE2', // Fundo área de imagem do card
    surface:   '#F9FAFB',
    white:     '#FFFFFF',
    t9:        '#111827',
    t6:        '#4B5563',
    t4:        '#9CA3AF',
    bd:        '#E5E7EB',
    gray100:   '#F3F4F6',
    promo:     '#C0694A', // terracota — nunca #E65100
    promoBg:   '#FBF1EE',
    indigo:    '#3730A3',
    indigoBg:  '#EEF2FF',
    rating:    '#FBBF24',
    danger:    '#EF4444',
    lime:      '#D4F567',
    badgeDietBg: '#EAF7EA',
    badgeDietTx: '#2C742F',
    badgeDietBd: '#C6E6C7',
  },
  radius: {
    input:  '8px',
    sel:    '10px',  // add-to-cart, qty-pill
    inner:  '12px',
    modal:  '16px',
    card:   '20px',  // ProductCard, CategoryCard
    pill:   '100px', // badges, chips
  },
  shadow: {
    card:      '0 10px 30px rgba(0,0,0,.05)',
    cardHover: '0 20px 50px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.04)',
    drawer:    '0 0 40px rgba(0,0,0,.15)',
  },
  ease: '.18s cubic-bezier(.4,0,.2,1)',
} as const
