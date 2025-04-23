import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'
import type { Config } from 'tailwindcss'

/**
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      screens: {
        xl: '1024px',
        '2xl': '1024px',
      },
    },
    extend: {
      screens: {
        phone: { max: '639px' },
      },
    },
  },
  plugins: [typography, daisyui],
  important: '#album-mode-root',
  daisyui: {
    logs: false,
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
