import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        g:      '#00B207',
        gd:     '#2C742F',
        gdeep:  '#002603',
        ghover: '#1A5C1E',
        cream:  '#F9F5EF',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      borderRadius: {
        sel:   '10px',
        card:  '20px',
        pill:  '100px',
      },
      boxShadow: {
        card:       '0 10px 30px rgba(0,0,0,.05)',
        'card-hover':'0 20px 50px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.04)',
        drawer:     '0 0 40px rgba(0,0,0,.15)',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
}

export default config
