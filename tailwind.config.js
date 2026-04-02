/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dim: 'rgba(99,102,241,.12)',
        },
        surface: {
          0: '#0a0b0f',
          1: '#111318',
          2: '#1a1d24',
          3: '#22262f',
          4: '#2a2f3a',
        },
        border: {
          DEFAULT: '#2a2f3a',
          light: '#333845',
        },
        text: {
          primary: '#f1f3f5',
          secondary: '#c9cdd5',
          muted: '#8b92a0',
          dim: '#5c6370',
        },
        green: {
          DEFAULT: '#22c55e',
        },
        cyan: {
          DEFAULT: '#06b6d4',
        },
      },
    },
  },
  plugins: [],
};
