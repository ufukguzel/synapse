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

/**
 * Corner radii from the handoff: chips 10, progress 4, buttons 16, cards 18,
 * large panels 24. `lg`/`xl`/`xxl` are named for those roles rather than an
 * abstract scale so a card cannot accidentally be given the button radius.
 */
export const radius = {
  none: 0,
  xs: 4, // progress bars
  sm: 8,
  md: 10, // chips
  lg: 16, // buttons
  card: 18, // cards
  xl: 24, // large panels
  xxl: 28,
  pill: 999,
} as const;

/**
 * The handoff specifies one card shadow: `0 24px 60px rgba(0,0,0,.45)`. On a
 * deep-space background a shadow reads as depth rather than a grey smudge, so it
 * is deliberately much larger and darker than a light-theme shadow would be.
 * `sm`/`lg` are proportional steps around that spec.
 */
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 60,
    shadowOffset: {width: 0, height: 24},
    elevation: 12,
  },
  lg: {
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 80,
    shadowOffset: {width: 0, height: 32},
    elevation: 20,
  },
} as const;

/** Fixed control metrics from the handoff. */
export const sizing = {
  buttonHeight: 50,
  progressHeight: 8,
  inputHeight: 52,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Sizing = keyof typeof sizing;
