export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#12141A',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  md: {
    shadowColor: '#12141A',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 5,
  },
  lg: {
    shadowColor: '#12141A',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 10,
  },
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
