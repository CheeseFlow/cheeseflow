/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['brandon-grotesque', 'sans-serif'],
        body: ['tt-commons-pro', 'sans-serif'],
        chinese: ['noto-sans-sc', 'sans-serif'],
      },
      colors: {
        ink: '#111111',
        brand: '#f8d117',
        grey: '#dadada',
      },
    },
  },
  plugins: [],
}
