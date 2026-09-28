import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        verbal: '#3b82f6',
        kuantitatif: '#10b981',
        logika: '#8b5cf6',

        // Warm minimal — dipakai untuk permukaan & teks.
        // Krem, bukan putih murni: putih #fff + teks hitam pekat memicu
        // halation yang melelahkan saat belajar berjam-jam.
        canvas:  '#FAF9F6',
        surface: '#FFFFFF',
        line:    '#E9E5DD',
        ink:     '#14181F',
        body:    '#41474F',
        muted:   '#767C87',
      },
      animation: {
        'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      maxWidth: {
        content: '1100px',
      },
    },
  },
  plugins: [],
}

export default config
