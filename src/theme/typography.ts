import {Platform, TextStyle} from 'react-native';

/**
 * Font families. Swap these for the fonts used in the design files
 * once the .ttf/.otf assets are added to src/assets/fonts.
 */
export const fontFamily = {
  regular: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}) as string,
  medium: Platform.select({ios: 'System', android: 'Roboto-Medium', default: 'System'}) as string,
  semibold: Platform.select({ios: 'System', android: 'Roboto-Medium', default: 'System'}) as string,
  bold: Platform.select({ios: 'System', android: 'Roboto-Bold', default: 'System'}) as string,
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} satisfies Record<string, TextStyle['fontWeight']>;

export const textVariants = {
  display: {fontSize: 34, lineHeight: 42, fontWeight: fontWeight.bold, letterSpacing: -0.5},
  h1: {fontSize: 28, lineHeight: 36, fontWeight: fontWeight.bold, letterSpacing: -0.3},
  h2: {fontSize: 22, lineHeight: 30, fontWeight: fontWeight.bold},
  h3: {fontSize: 18, lineHeight: 26, fontWeight: fontWeight.semibold},
  bodyLg: {fontSize: 17, lineHeight: 26, fontWeight: fontWeight.regular},
  body: {fontSize: 15, lineHeight: 23, fontWeight: fontWeight.regular},
  bodyStrong: {fontSize: 15, lineHeight: 23, fontWeight: fontWeight.semibold},
  caption: {fontSize: 13, lineHeight: 18, fontWeight: fontWeight.regular},
  overline: {fontSize: 11, lineHeight: 14, fontWeight: fontWeight.semibold, letterSpacing: 0.8},
  button: {fontSize: 16, lineHeight: 22, fontWeight: fontWeight.semibold},
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
