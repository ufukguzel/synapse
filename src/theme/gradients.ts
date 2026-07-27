import {palette} from './colors';

/**
 * Design tokens - gradients.
 *
 * Kept as flat colour arrays so they can be handed straight to
 * <LinearGradient colors={...}>. Every gradient runs light-to-dark along its
 * axis, which lets a solid `edge` colour sit underneath a pressed button or
 * card and still read as the same material.
 */
export interface Gradient {
  colors: readonly [string, string, ...string[]];
  /** Solid colour for the 3D bottom edge / pressed state of this gradient. */
  edge: string;
}

/**
 * `brand` and `hero` follow the logo's own axon gradient (violet -> teal). Keeping
 * them on the same axis means a button, a hero and the mark all read as one
 * material instead of three different purples.
 */
const lightGradients = {
  brand: {colors: [palette.primary500, '#4FA8E8'], edge: palette.primary700},
  brandSoft: {colors: [palette.primary50, palette.primary100], edge: palette.primary300},
  accent: {colors: [palette.accent500, '#F79A45'], edge: palette.accent600},
  teal: {colors: [palette.teal500, palette.teal600], edge: '#0E9E85'},
  success: {colors: [palette.success500, '#1FA85C'], edge: '#17864A'},
  danger: {colors: [palette.danger500, '#D93036'], edge: '#B02329'},
  // Runs the full logo sweep, violet through to the teal terminal.
  hero: {colors: [palette.primary600, palette.primary500, '#3FBFD6'], edge: palette.primary700},
} as const satisfies Record<string, Gradient>;

const darkGradients = {
  brand: {colors: [palette.primary500, '#2E86C7'], edge: palette.ink900},
  brandSoft: {
    colors: ['rgba(123, 97, 255, 0.26)', 'rgba(33, 230, 193, 0.14)'],
    edge: palette.ink500,
  },
  accent: {colors: [palette.accent500, '#E0912F'], edge: '#B4701A'},
  teal: {colors: [palette.teal500, palette.teal600], edge: '#0B7A66'},
  success: {colors: [palette.success500, '#1B9552'], edge: '#12703C'},
  danger: {colors: [palette.danger500, '#C42A30'], edge: '#8E1D22'},
  hero: {colors: ['#3A2A8C', palette.primary600, '#1C8C9E'], edge: palette.ink900},
} as const satisfies Record<string, Gradient>;

export type GradientName = keyof typeof lightGradients;
export type AppGradients = Record<GradientName, Gradient>;

export const gradientsFor = (scheme: 'light' | 'dark'): AppGradients =>
  scheme === 'dark' ? darkGradients : lightGradients;
