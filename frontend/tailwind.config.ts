import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // TUT brand palette
        tut: {
          blue:  '#003580',
          gold:  '#F5A623',
          light: '#E8EEF8',
        },
        risk: {
          high:   '#DC2626',
          medium: '#D97706',
          low:    '#16A34A',
          none:   '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
