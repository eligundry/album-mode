const defaultTheme = require('tailwindcss/defaultTheme')

/**
 * @type {import("@types/tailwindcss/tailwind-config").TailwindConfig}
 */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      white: '#fff',
      slate: 'rgb(226, 223, 240)',
      primary: '#3b82f6',
      primaryHover: '#1d4ed8',
      info: '#22c55e',
      infoHover: '#15803d',
      warning: '#eab308',
      warningHover: '#a16207',
      danger: '#ef4444',
      dangerHover: '#b91c1c',
      grey: '#64748b',
      formBorder: '#cccccc',
    },
    extend: {
      screens: defaultTheme.screens,
    },
  },
  plugins: [],
}
