module.exports = {
  mode: 'jit',
  darkMode: 'class',
  purge: ['./public/**/*.html', './packages/renderer/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#4e33ff',
        gray: {
          '1000': '#0e131f',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.05)',
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
