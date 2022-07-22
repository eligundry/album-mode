const defaultTheme = require('tailwindcss/defaultTheme')

/**
 * @type {import("@types/tailwindcss/tailwind-config").TailwindConfig}
 */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  // theme: {
  //   colors: {
  //     white: '#fff',
  //     black: '#000',
  //     slate: 'rgb(226, 223, 240)',
  //     grey: '#64748b',
  //     formBorder: '#cccccc',
  //     darkModeInput: '#202327',
  //   },
  // },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#66CC8A',
          secondary: '#377CFB',
          accent: '#EA5234',
          neutral: '#333C4D',
          'base-100': '#FFFFFF',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
        },
      },
      {
        dark: {
          primary: '#66CC8A',
          secondary: '#377CFB',
          accent: '#EA5234',
          neutral: '#191D24',
          'base-100': '#2A303C',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
        },
      },
    ],
  },
}
