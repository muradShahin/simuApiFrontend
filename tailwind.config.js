/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',
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
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
          4: 'var(--bg-4)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
        text: {
          primary: 'var(--text-0)',
          secondary: 'var(--text-1)',
          muted: 'var(--text-2)',
          dim: 'var(--text-3)',
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
