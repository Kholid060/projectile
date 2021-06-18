module.exports = {
  mode: 'jit',
  darkMode: 'class',
  purge: ['./public/**/*.html', './packages/renderer/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        gray: {
          '1000': '#0e131f',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.05)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.50'),
            strong: {
              fontWeight: '600',
              color: theme('colors.gray.50'),
            },
            a: {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.500'),
              },
            },
            h1: { color: 'white', fontWeight: '600' },
            h2: { color: 'white', fontWeight: '600' },
            h3: { color: 'white', fontWeight: '600' },
            h4: { color: 'white', fontWeight: '600' },
            h5: { color: 'white', fontWeight: '600' },
            h6: { color: 'white', fontWeight: '600' },
            code: { color: 'white' },
            blockquote: { color: theme('colors.gray.50') },
          },
        },
      }),
    },
    container: {
      center: true,
    },
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
