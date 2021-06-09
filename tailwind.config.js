module.exports = {
  mode: 'jit',
  darkMode: 'class',
  purge: ['./public/**/*.html', './packages/renderer/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#4e33ff',
      },
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
