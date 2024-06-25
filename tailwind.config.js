/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'text': 'var(--text)',
      'background': 'var(--background)',
      'primary': 'var(--primary)',
      'secondary': 'var(--secondary)',
      'accent': 'var(--accent)',
    },
    fontSize: {
      sm: '0.800rem',
      base: '1rem',
      xl: '1.250rem',
      '2xl': '1.563rem',
      '3xl': '1.954rem',
      '4xl': '2.442rem',
      '5xl': '3.053rem',
    },
    fontFamily: {
      heading: 'JetBrains Mono',
      body: 'JetBrains Mono',
    },
    fontWeight: {
      normal: '400',
      bold: '700',
    },
    extend: {},
  },
  darkMode: 'selector',
  plugins: [],
}
