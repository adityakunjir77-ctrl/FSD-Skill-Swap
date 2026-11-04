/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Single accent: the SkillSwap teal. Used for links, active state, focus and the logo mark.
        brand: {
          teal: '#0F766E',
          'teal-hover': '#115E59',
          'teal-dark': '#0A4F4A',
          'teal-tint': '#D3E8E4',
          'teal-surface': '#EEF5F3',
        },
        // Reciprocity markers: "teaches" (accent) vs "wants to learn" (ochre). Rendered as text + hairline.
        teach: {
          bg: '#EEF5F3',
          text: '#0F766E',
          border: '#A9D3CC',
        },
        learn: {
          bg: '#FBF3E4',
          text: '#8A5300',
          border: '#E3CA9C',
        },
        // Paper and rules
        canvas: {
          DEFAULT: '#F6F7F5',
          subtle: '#EEF0EE',
          card: '#FFFFFF',
          border: '#D9DEDB',
          'border-dark': '#B4BDB9',
        },
        ink: {
          primary: '#14201E',
          secondary: '#4B5A57',
          muted: '#66726F',
          faint: '#B8C2BF',
        },
        status: {
          success: '#166534',
          'success-bg': '#E7F3EA',
          warning: '#92400E',
          'warning-bg': '#FBF0DC',
          danger: '#B42318',
          'danger-bg': '#FBE9E7',
        },
      },
      fontFamily: {
        // Display serif for headlines, numerals and pull quotes
        display: ['Newsreader', 'Georgia', '"Times New Roman"', 'serif'],
        // UI + body grotesk. `heading` is kept as an alias for UI labels.
        heading: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Perfect-fourth scale (1.333) on a 16px base, for display type
      fontSize: {
        'title': ['1.3125rem', { lineHeight: '1.3' }],          // 21
        'display-sm': ['1.75rem', { lineHeight: '1.15' }],      // 28
        'display-md': ['2.3125rem', { lineHeight: '1.1' }],     // 37
        'display-lg': ['3.125rem', { lineHeight: '1.04' }],     // 50
        'display-xl': ['clamp(3rem, 7.4vw, 5.5rem)', { lineHeight: '0.98' }], // 48 → 88
      },
      borderRadius: {
        card: '2px',
        button: '2px',
        input: '2px',
      },
      boxShadow: {
        soft: 'none',
        elevated: '0 1px 0 rgba(20, 32, 30, 0.04), 0 12px 32px -12px rgba(20, 32, 30, 0.18)',
      },
      spacing: {
        18: '4.5rem',
      },
      borderWidth: {
        3: '3px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'swap-left': {
          from: { opacity: '0', transform: 'translateX(-2.5rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'drawer-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'swap-right': {
          from: { opacity: '0', transform: 'translateX(2.5rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        'rise-in': 'rise-in 220ms ease-out',
        'drawer-in': 'drawer-in 200ms cubic-bezier(0.2, 0.7, 0.1, 1)',
        'swap-left': 'swap-left 700ms cubic-bezier(0.2, 0.7, 0.1, 1) both',
        'swap-right': 'swap-right 700ms cubic-bezier(0.2, 0.7, 0.1, 1) 120ms both',
      },
    },
  },
  plugins: [],
};
