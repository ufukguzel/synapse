/**
 * Design tokens - colors.
 * NOTE: placeholder palette. Will be replaced with the exact values
 * from the Synapse design files.
 */
export const palette = {
  // Brand
  primary50: '#EEF0FF',
  primary100: '#DDE1FF',
  primary300: '#A5AEFF',
  primary500: '#5B63F5',
  primary600: '#4A50DB',
  primary700: '#3A3FB0',

  // Accent (streaks, XP, gamification)
  accent500: '#FF9F45',
  accent600: '#F5851F',

  // Semantic
  success500: '#2EBD6B',
  success100: '#DCF7E7',
  warning500: '#F2B01E',
  warning100: '#FEF3D7',
  danger500: '#E5484D',
  danger100: '#FDE0E1',
  info500: '#3B82F6',

  // Neutrals
  white: '#FFFFFF',
  gray25: '#FCFCFD',
  gray50: '#F8F9FC',
  gray100: '#F1F3F9',
  gray200: '#E4E7F0',
  gray300: '#CDD2E0',
  gray400: '#98A0B5',
  gray500: '#6B7391',
  gray600: '#4B5268',
  gray700: '#343A4C',
  gray800: '#22262F',
  gray900: '#12141A',
  black: '#000000',

  transparent: 'transparent',
} as const;

const lightColorsBase = {
  background: palette.white,
  backgroundAlt: palette.gray50,
  surface: palette.white,
  surfaceAlt: palette.gray100,
  border: palette.gray200,
  borderStrong: palette.gray300,

  text: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textInverse: palette.white,

  primary: palette.primary500,
  primaryPressed: palette.primary600,
  primarySoft: palette.primary50,
  onPrimary: palette.white,

  accent: palette.accent500,
  success: palette.success500,
  successSoft: palette.success100,
  warning: palette.warning500,
  warningSoft: palette.warning100,
  danger: palette.danger500,
  dangerSoft: palette.danger100,
  info: palette.info500,

  overlay: 'rgba(18, 20, 26, 0.55)',
  skeleton: palette.gray100,
} as const;

export type AppColors = {[K in keyof typeof lightColorsBase]: string};

export const lightColors: AppColors = lightColorsBase;

export const darkColors: AppColors = {
  background: palette.gray900,
  backgroundAlt: palette.gray800,
  surface: palette.gray800,
  surfaceAlt: palette.gray700,
  border: palette.gray700,
  borderStrong: palette.gray600,

  text: palette.white,
  textSecondary: palette.gray300,
  textTertiary: palette.gray400,
  textInverse: palette.gray900,

  primary: palette.primary300,
  primaryPressed: palette.primary500,
  primarySoft: 'rgba(91, 99, 245, 0.16)',
  onPrimary: palette.gray900,

  accent: palette.accent500,
  success: palette.success500,
  successSoft: 'rgba(46, 189, 107, 0.16)',
  warning: palette.warning500,
  warningSoft: 'rgba(242, 176, 30, 0.16)',
  danger: palette.danger500,
  dangerSoft: 'rgba(229, 72, 77, 0.16)',
  info: palette.info500,

  overlay: 'rgba(0, 0, 0, 0.65)',
  skeleton: palette.gray700,
};

