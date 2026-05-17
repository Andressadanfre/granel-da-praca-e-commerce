import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verdes da marca
        g:        '#00B207', // CTA conversão máxima
        gd:       '#2C742F', // Add-to-cart
        gdeep:    '#002603', // TopBar, preços, logo
        ghover:   '#1A5C1E', // Hover único de todos os CTAs
        'g-muted':'#F1F8E9', // Hover botão secondary
        // Backgrounds
        cream:    '#F9F5EF', // Background geral — nunca branco puro
        'cream-img': '#F0EBE2', // Fundo área de imagem do ProductCard
        surface:  '#F9FAFB', // Fundo de cards, inputs
        // Texto
        t9:       '#111827', // Texto primário
        t6:       '#4B5563', // Textos de suporte
        t4:       '#9CA3AF', // Labels muted, placeholder
        // Bordas
        bd:       '#E5E7EB', // Bordas padrão
        'gray-100': '#F3F4F6', // Superfícies secundárias
        // Badges e estados
        promo:    '#C0694A', // Terracota — nunca #E65100
        'promo-bg': '#FBF1EE',
        indigo:   '#3730A3', // Badge "Por unidade"
        'indigo-bg': '#EEF2FF',
        rating:   '#FBBF24', // Estrelas
        // Estados de erro e destructive
        danger:   '#EF4444', // Estoque crítico, erros
        'danger-btn': '#C62828', // Fundo do botão Danger
        'danger-btn-hover': '#B71C1C',
        // Skeleton
        'skeleton-base':    '#E5E7EB',
        'skeleton-shimmer': '#F3F4F6',
        // Badge dieta
        'badge-diet-bg': '#EAF7EA',
        'badge-diet-tx': '#2C742F',
        'badge-diet-bd': '#C6E6C7',
        // Lime (ofertas)
        lime: '#D4F567',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      borderRadius: {
        input: '8px',
        sel:   '10px',
        inner: '12px',
        modal: '16px',
        card:  '20px',
        pill:  '100px',
      },
      boxShadow: {
        card:         '0 10px 30px rgba(0,0,0,.05)',
        'card-hover': '0 20px 50px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.04)',
        drawer:       '0 0 40px rgba(0,0,0,.15)',
      },
      maxWidth: {
        container: '1280px',
      },
      spacing: {
        's1':  '4px',
        's2':  '8px',
        's3':  '12px',
        's4':  '16px',
        's5':  '20px',
        's6':  '24px',
        's8':  '32px',
        's10': '40px',
        's12': '48px',
        's20': '80px',
      },
    },
  },
  plugins: [],
}

export default config