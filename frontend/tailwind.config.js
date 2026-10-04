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
          dark: '#0f172a',
          primary: '#35588E',
          light: '#e2e8f0',
          accent: '#3b82f6',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "linear-gradient(to right bottom, rgba(15, 23, 42, 0.9), rgba(53, 88, 142, 0.8))",
      }
    },
  },
  plugins: [],
}
