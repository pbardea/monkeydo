/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'monkey-bg': '#323437',
        'monkey-text': '#d1d0c5',
        'monkey-muted': '#646669',
        'monkey-accent': '#e2b714',
        'monkey-error': '#ca4754',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
