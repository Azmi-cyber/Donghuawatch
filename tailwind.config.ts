import type { Config } from 'tailwindcss';

// Tema neobrutalism: abu-abu + emas, border tebal hitam, bayangan keras tanpa blur.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    borderRadius: { none: '0', sm: '2px', DEFAULT: '4px', md: '4px', lg: '6px', xl: '8px', '2xl': '10px', full: '9999px' },
    borderWidth: { DEFAULT: '2px', 0: '0', 2: '2px', 3: '3px', 4: '4px', 8: '8px' },
    extend: {
      colors: {
        bg: '#303034',
        surface: { DEFAULT: '#3d3d42', 2: '#4b4b52' },
        line: '#0a0a0a',
        gold: { DEFAULT: '#f2c230', light: '#ffd75e', dark: '#b8901a' },
        ink: '#f5f5f4',
        muted: '#c4c4cc',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0 0 #0a0a0a',
        brutal: '4px 4px 0 0 #0a0a0a',
        'brutal-lg': '6px 6px 0 0 #0a0a0a',
        'brutal-gold': '5px 5px 0 0 #f2c230',
        glow: '5px 5px 0 0 #f2c230',
        'gold-sm': '4px 4px 0 0 #0a0a0a',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(#f2c230,#f2c230)',
      },
    },
  },
  plugins: [],
};
export default config;
