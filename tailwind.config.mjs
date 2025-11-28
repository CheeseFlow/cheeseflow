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
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--colour-ink)',
            fontFamily: 'var(--font-body)',
            maxWidth: 'none',
            h2: {
              fontFamily: 'var(--font-body)',
              fontSize: '2rem',
              fontWeight: '900',
              marginTop: '2rem',
              marginBottom: '1rem',
              lineHeight: '1.25',
              color: 'var(--colour-ink)',
            },
            h3: {
              fontFamily: 'var(--font-body)',
              fontSize: '1.5rem',
              fontWeight: '900',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              lineHeight: '1.25',
              color: 'var(--colour-ink)',
            },
            h4: {
              fontFamily: 'var(--font-body)',
              fontSize: '1.25rem',
              fontWeight: '900',
              marginTop: '1.25rem',
              marginBottom: '0.5rem',
              lineHeight: '1.25',
              color: 'var(--colour-ink)',
            },
            p: {
              fontSize: '1.25rem',
              lineHeight: '1.75',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              color: 'var(--colour-ink-80)',
              '&:first-child': {
                marginTop: '0',
              },
              '&:last-child': {
                marginBottom: '0',
              },
            },
            ul: {
              marginBottom: '1.25rem',
              paddingLeft: '1.5rem',
              listStyleType: 'disc',
            },
            ol: {
              marginBottom: '1.25rem',
              paddingLeft: '1.5rem',
              listStyleType: 'decimal',
            },
            li: {
              fontSize: '1.25rem',
              lineHeight: '1.75',
              marginBottom: '0.5rem',
              color: 'var(--colour-ink-80)',
            },
            a: {
              color: 'var(--colour-ink)',
              textDecoration: 'underline',
              '&:hover': {
                color: 'var(--colour-ink-80)',
              },
            },
            img: {
              display: 'block',
              margin: '2rem auto',
            },
            strong: {
              fontWeight: '700',
              color: 'var(--colour-ink)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
