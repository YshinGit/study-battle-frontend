/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta Aventurine
        abyss:   '#005c77', // azul profundo (principal)
        gold:    '#bfa862', // dorado (principal)
        sand:    '#ba9e75', // arena
        orchid:  '#cf6ffa', // violeta/lila (acento)
        sky:     '#6db3f7', // azul claro (acento)
        // Neutros base
        ink:     '#0b1220',
        panel:   '#101a2b',
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(191,168,98,0.25)',
        'glow-violet': '0 0 30px rgba(207,111,250,0.25)',
      },
      animation: {
       'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
       'floatUp': 'floatUp 2s ease-out forwards',
     },
     keyframes: {
  floatUp: {
    '0%':   { opacity: '0', transform: 'translateY(0)' },
    '15%':  { opacity: '1' },
    '100%': { opacity: '0', transform: 'translateY(-40px)' },
  },
},
    },
  },
  plugins: [],
}
