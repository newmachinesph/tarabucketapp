// Single source of truth for the brand palette.
//
// CommonJS on purpose: `tailwind.config.js` must `require()` this, and `src/lib/tokens.ts`
// imports it. Keeping one copy is the point — when the palette lived in both files, the four
// colors that never made it into the Tailwind config (green, red, violet, white) had no class,
// so every use of them was forced into an inline `style={{}}`. That's what produced 40+ inline
// styles per screen. Add a color here and it gets both a `C.*` token and a `brand-*` class.
module.exports = {
  blue: '#14A3E1',
  'blue-dark': '#0B84C4',
  orange: '#FF5A36',
  'orange-dark': '#E8431F',
  ink: '#0E1726',
  muted: '#5B6B7B',
  faint: '#9AA7B4',
  surface: '#F2F6FA',
  white: '#FFFFFF',
  line: 'rgba(14,23,38,0.08)',
  green: '#22C58B',
  red: '#FF4D67',
  violet: '#7C4DFF',
  // Off-state of every Switch in the app. Was a bare '#D8DEE6' copy-pasted across four screens.
  track: '#D8DEE6',
};
