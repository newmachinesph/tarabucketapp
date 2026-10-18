/** @type {import('tailwindcss').Config} */
// The palette is defined once in src/lib/colors.js and consumed here and by src/lib/tokens.ts,
// so a `brand-*` class and a `C.*` token can never drift apart.
const brand = require('./src/lib/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: { brand },
    },
  },
  plugins: [],
};
