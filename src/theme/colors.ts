/**
 * Design tokens - colors.
 *
 * Values come verbatim from the developer handoff ("Tasarım Tokenları" in
 * README.md, cross-checked against Synapse Brand.dc.html). The identity is
 * dark-first: Deep Space is *the* background, Mist is *the* text colour. The
 * light map below is a derived courtesy variant - the handoff does not specify
 * one, so treat dark as the source of truth when the two disagree.
 */
export const brand = {
  neuralPurple: '#7B61FF', // primary / brand
  synapseTeal: '#21E6C1', // success / active
  sparkGold: '#FFC15E', // streak / reward
  deepSpace: '#0D0B1A', // background
  deepSpaceOuter: '#08070F', // outermost background
  cardSurface: '#14112A', // card / panel surface
  mist: '#ECEAFE', // text on dark (primary)
  nebula: '#6B6788', // muted / secondary
  bodyMuted: '#9A96B8', // body text (dimmed)
  hairline: '#221F38', // card borders
  negative: '#FF5C7A', // errors
} as const;

export const palette = {
  // Brand ramps around the three brand hues
  primary50: '#F1EEFF',
  primary100: '#E2DCFF',
  primary300: '#B7A6FF',
  primary500: brand.neuralPurple,
  primary600: '#6A4FE6',
  primary700: '#523BBF',

  teal300: '#7DF2DF',
  teal500: brand.synapseTeal,
  teal600: '#12C4A4',

  accent500: brand.sparkGold,
  accent600: '#F0A63B',

  // Semantic. Note teal is the brand's success colour, not a generic green.
  success500: brand.synapseTeal,
  warning500: brand.sparkGold,
  danger500: brand.negative,
  info500: brand.neuralPurple,

  // Deep-space neutral ramp
  ink900: brand.deepSpaceOuter,
  ink800: brand.deepSpace,
  ink700: brand.cardSurface,
  ink600: '#1C1838',
  ink500: brand.hairline,
  ink400: '#2A2550',
  mist: brand.mist,
  bodyMuted: brand.bodyMuted,
  nebula: brand.nebula,

  // Light-variant neutrals (derived, not from the handoff)
  white: '#FFFFFF',
  gray50: '#F8F7FC',
  gray100: '#F1EFF7',
  gray200: '#E3E0EE',
  gray300: '#CBC7DC',
  gray400: '#9A95B0',
  gray900: brand.deepSpace,
  black: '#000000',

  transparent: 'transparent',
} as const;

/** The brand theme. */
const darkColorsBase = {
  background: brand.deepSpace,
  backgroundAlt: brand.deepSpaceOuter,
  surface: brand.cardSurface,
  surfaceAlt: palette.ink600,
  border: brand.hairline,
  borderStrong: palette.ink400,

  text: brand.mist,
  textSecondary: brand.bodyMuted,
  textTertiary: brand.nebula,
  textInverse: brand.deepSpace,

  primary: brand.neuralPurple,
  primaryPressed: palette.primary600,
  primarySoft: 'rgba(123, 97, 255, 0.16)',
  onPrimary: brand.mist,

  accent: brand.sparkGold,
  success: brand.synapseTeal,
  successSoft: 'rgba(33, 230, 193, 0.14)',
  warning: brand.sparkGold,
  warningSoft: 'rgba(255, 193, 94, 0.14)',
  danger: brand.negative,
  dangerSoft: 'rgba(255, 92, 122, 0.14)',
  info: brand.neuralPurple,

  overlay: 'rgba(8, 7, 15, 0.72)',
  skeleton: palette.ink600,
} as const;

export type AppColors = {[K in keyof typeof darkColorsBase]: string};

export const darkColors: AppColors = darkColorsBase;

/** Derived light variant - offered as a user preference only. */
export const lightColors: AppColors = {
  background: palette.white,
  backgroundAlt: palette.gray50,
  surface: palette.white,
  surfaceAlt: palette.gray100,
  border: palette.gray200,
  borderStrong: palette.gray300,

  text: brand.deepSpace,
  textSecondary: '#55516F',
  textTertiary: brand.nebula,
  textInverse: palette.white,

  primary: brand.neuralPurple,
  primaryPressed: palette.primary600,
  primarySoft: palette.primary50,
  onPrimary: palette.white,

  accent: '#E09A2E',
  success: palette.teal600,
  successSoft: '#D8F8F1',
  warning: '#C98A1B',
  warningSoft: '#FDF1DC',
  danger: '#E0405F',
  dangerSoft: '#FCE1E6',
  info: brand.neuralPurple,

  overlay: 'rgba(13, 11, 26, 0.55)',
  skeleton: palette.gray100,
};
