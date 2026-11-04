/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0F766E',
          'teal-hover': '#115E59',
          'teal-dark': '#0A4F4A',
          'teal-tint': '#CCFBF1',
          'teal-surface': '#F0FDFA',
          coral: '#F2674A',
          'coral-hover': '#E05336',
          'coral-tint': '#FEECE8',
        },
        teach: {
          bg: '#E6F6F3',
          text: '#0F766E',
          border: '#BCECE3',
        },
        learn: {
          bg: '#FFF1DB',
          text: '#9A5B00',
          border: '#FCE2B6',
        },
        canvas: {
          DEFAULT: '#F7F8F7',
          subtle: '#F0F2F1',
          card: '#FFFFFF',
          border: '#E4E7E5',
          'border-dark': '#D1D7D4',
        },
        ink: {
          primary: '#14201E',
          secondary: '#4B5A57',
          muted: '#8A9794',
          faint: '#B8C2BF',
        },
        status: {
          success: '#15803D',
          'success-bg': '#DCFCE7',
          warning: '#B45309',
          'warning-bg': '#FEF3C7',
          danger: '#B42318',
          'danger-bg': '#FEE2E2',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        button: '10px',
        input: '10px',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(20, 32, 30, 0.04)',
        elevated: '0 4px 16px -2px rgba(20, 32, 30, 0.06)',
      },
    },
  },
  plugins: [],
};
