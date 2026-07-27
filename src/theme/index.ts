import {AppColors, brand, darkColors, lightColors, palette} from './colors';
import {gradientsFor} from './gradients';
import {radius, shadow, spacing} from './spacing';
import {fontFamily, fontWeight, textVariants} from './typography';

export const buildTheme = (scheme: 'light' | 'dark') => ({
  scheme,
  colors: scheme === 'dark' ? darkColors : lightColors,
  gradients: gradientsFor(scheme),
  brand,
  palette,
  spacing,
  radius,
  shadow,
  fontFamily,
  fontWeight,
  textVariants,
});

export type AppTheme = ReturnType<typeof buildTheme>;
export type {AppColors};
export {brand, darkColors, lightColors, palette, radius, shadow, spacing, fontFamily, fontWeight, textVariants};
export * from './gradients';
export * from './typography';
