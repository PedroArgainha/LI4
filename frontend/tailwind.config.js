/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Stitch design system ─────────────────────
        primary:   '#041525',   // azul marinho
        secondary: '#775A19',   // dourado
        tertiary:  '#18140D',   // castanho escuro
        neutral:   '#F8F9FA',   // fundo claro

        // ramps completos do Stitch (para badges, hover, etc.)
        'primary-container':    '#1A2A3A',
        'primary-fixed':        '#D3E4FA',
        'primary-fixed-dim':    '#B7C8DE',
        'on-primary':           '#FFFFFF',
        'on-primary-fixed':     '#0C1D2D',
        'on-primary-container': '#8191A6',

        'secondary-container':     '#FDD587',
        'secondary-fixed':         '#FFDEA3',
        'secondary-fixed-dim':     '#E8C176',
        'on-secondary':            '#FFFFFF',
        'on-secondary-fixed':      '#261900',
        'on-secondary-container':  '#785A19',

        'tertiary-container':    '#2D2820',
        'tertiary-fixed':        '#EBE1D5',
        'tertiary-fixed-dim':    '#CEC5BA',
        'on-tertiary':           '#FFFFFF',
        'on-tertiary-fixed':     '#1F1B14',
        'on-tertiary-container': '#968F84',

        // surface system
        'surface':                   '#F8F9FA',
        'surface-dim':               '#D9DADB',
        'surface-bright':            '#F8F9FA',
        'surface-container-lowest':  '#FFFFFF',
        'surface-container-low':     '#F3F4F5',
        'surface-container':         '#EDEEEF',
        'surface-container-high':    '#E7E8E9',
        'surface-container-highest': '#E1E3E4',
        'surface-variant':           '#E1E3E4',
        'surface-tint':              '#506073',

        // on-surface
        'on-surface':         '#191C1D',
        'on-surface-variant': '#44474C',
        'inverse-surface':    '#2E3132',
        'inverse-on-surface': '#F0F1F2',
        'inverse-primary':    '#B7C8DE',

        // outline
        'outline':         '#74777D',
        'outline-variant': '#C4C6CC',

        // error
        'error':           '#BA1A1A',
        'error-container': '#FFDAD6',
        'on-error':        '#FFFFFF',

        // background
        'background':    '#F8F9FA',
        'on-background': '#191C1D',

        // ── brand (laranja — para backoffice interno) ─
        brand: {
          50:  '#fdf6ee',
          100: '#fbe8cc',
          200: '#f6cf95',
          300: '#f0b05c',
          400: '#ea9430',
          500: '#d97918',
          600: '#b75e12',
          700: '#934710',
          800: '#773a12',
          900: '#633110',
        },
      },

      fontFamily: {
        'noto-serif': ['"Noto Serif"', 'Georgia', 'serif'],
        'manrope':    ['Manrope', 'system-ui', 'sans-serif'],
        sans:         ['Manrope', 'system-ui', 'sans-serif'],

        // aliases usados nas classes do Stitch
        'headline-xl': ['"Noto Serif"', 'Georgia', 'serif'],
        'headline-lg': ['"Noto Serif"', 'Georgia', 'serif'],
        'headline-md': ['"Noto Serif"', 'Georgia', 'serif'],
        'body-lg':     ['Manrope', 'system-ui', 'sans-serif'],
        'body-md':     ['Manrope', 'system-ui', 'sans-serif'],
        'body-sm':     ['Manrope', 'system-ui', 'sans-serif'],
        'label-caps':  ['Manrope', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'headline-xl': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg':     ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md':     ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm':     ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-caps':  ['12px', { lineHeight: '1.2', letterSpacing: '0.1em', fontWeight: '700' }],
      },

      borderRadius: {
        DEFAULT: '0.125rem',  // 2px — Stitch usa bordas muito subtis
        lg:      '0.25rem',   // 4px
        xl:      '0.5rem',    // 8px
        full:    '0.75rem',   // 12px
      },

      spacing: {
        'xs':     '4px',
        'sm':     '12px',
        'md':     '24px',
        'lg':     '48px',
        'xl':     '80px',
        'gutter': '24px',
        'margin': '32px',
        'base':   '8px',
      },
    },
  },
  plugins: [],
}
