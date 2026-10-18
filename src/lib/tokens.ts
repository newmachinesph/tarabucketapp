import palette from './colors';

// Brand tokens (hex) for style props where className can't reach (icons, gradients, animated views).
// Hex values live in `./colors.js` so Tailwind and TypeScript read the same palette — see the note
// there. This is only the camelCase adapter over Tailwind's kebab-case keys; every color here also
// has a `brand-*` class, so reach for the class first and the token only when you can't.
export const C = {
  blue: palette.blue,
  blueDark: palette['blue-dark'],
  orange: palette.orange,
  orangeDark: palette['orange-dark'],
  ink: palette.ink,
  muted: palette.muted,
  faint: palette.faint,
  surface: palette.surface,
  white: palette.white,
  line: palette.line,
  green: palette.green,
  red: palette.red,
  violet: palette.violet,
  track: palette.track,
} as const;

export const FONT = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  black: 'Poppins_800ExtraBold',
} as const;

export const ORANGE_GRADIENT = ['#FF7A4D', '#FF5A36', '#E8431F'] as const;
export const BLUE_GRADIENT = ['#33B6EF', '#14A3E1', '#0B84C4'] as const;

// Translucent tint of a brand color as `#RRGGBBAA` — default 10% (0x1A). Used for icon chips and badges.
// ponytail: assumes 6-digit hex (all C.* qualify); pass a different alpha suffix for other opacities.
export const tint = (color: string, alpha = '1A') => `${color}${alpha}`;
