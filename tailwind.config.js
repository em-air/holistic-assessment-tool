/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'elevated': '0 8px 24px rgba(0,0,0,0.12)',
      },
      colors: {
        // Mind category colors (purple/lavender)
        mind: {
          50: '#f8f7ff',
          100: '#ede9fe', 
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Oral skills colors (beige/cream)
        oral: {
          50: '#fefdf8',
          100: '#fef7e0',
          200: '#fdecc8',
          300: '#fbd38d',
          400: '#f6ad55',
          500: '#ed8936',
        },
        // Academic skills colors (pink)
        academic: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
        },
        // Orange accent for buttons
        accent: {
          500: '#f97316',
          600: '#ea580c',
        }
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        grow360: {
          "primary": "#8b5cf6",
          "secondary": "#f97316", 
          "accent": "#ec4899",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
};