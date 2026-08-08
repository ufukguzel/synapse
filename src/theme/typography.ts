import {Platform, TextStyle} from 'react-native';

/**
 * The handoff calls for Space Grotesk (display/headings/numbers) and Inter
 * (body/UI). The font files are NOT part of the handoff package, so until the
 * .ttf files are added under src/assets/fonts and linked, `undefined` is used -
 * which makes React Native fall back to the system face instead of silently
 * rendering a missing-font box.
 *
 * To finish the switch: add the Google Fonts files, register them in
 * `react-native.config.js` assets, run `npx react-native-asset`, rebuild, then
 * replace the `undefined`s with the PostScript names below.
 */
const FONTS_INSTALLED = false;

const named = (name: string) => (FONTS_INSTALLED ? name : undefined);

/** Space Grotesk - headings, display, numerals. */
export const displayFont = {
  regular: named('SpaceGrotesk-Regular'),
  medium: named('SpaceGrotesk-Medium'),
  semibold: named('SpaceGrotesk-SemiBold'),
  bold: named('SpaceGrotesk-Bold'),
};

/** Inter - body copy and UI. */
export const bodyFont = {
  regular: named('Inter-Regular'),
  medium: named('Inter-Medium'),
  semibold: named('Inter-SemiBold'),
  bold: named('Inter-Bold'),
};

export const fontFamily = {
  regular: bodyFont.regular,
  medium: bodyFont.medium,
  semibold: bodyFont.semibold,
  bold: bodyFont.bold,
  display: displayFont.semibold,
  displayBold: displayFont.bold,
};

/**
 * Android needs the weight baked into the family name once the files land, so the
 * platform is captured here rather than at each call site.
 */
export const isAndroid = Platform.OS === 'android';

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} satisfies Record<string, TextStyle['fontWeight']>;

/**
 * Headings use the display face with the handoff's -0.025em tracking (expressed
 * in points per size, since RN letterSpacing is absolute). Body styles use the
 * body face.
 */
const tracking = (fontSize: number) => -0.025 * fontSize;

export const textVariants = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: fontWeight.bold,
    letterSpacing: tracking(34),
    fontFamily: displayFont.bold,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeight.bold,
    letterSpacing: tracking(28),
    fontFamily: displayFont.bold,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: fontWeight.semibold,
    letterSpacing: tracking(22),
    fontFamily: displayFont.semibold,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: fontWeight.semibold,
    letterSpacing: tracking(18),
    fontFamily: displayFont.semibold,
  },
  /** Big numerals - neural strength, XP, streak counts. */
  metric: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: fontWeight.bold,
    letterSpacing: tracking(40),
    fontFamily: displayFont.bold,
  },
  bodyLg: {fontSize: 17, lineHeight: 26, fontWeight: fontWeight.regular, fontFamily: bodyFont.regular},
  body: {fontSize: 15, lineHeight: 23, fontWeight: fontWeight.regular, fontFamily: bodyFont.regular},
  bodyStrong: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: fontWeight.semibold,
    fontFamily: bodyFont.semibold,
  },
  caption: {fontSize: 13, lineHeight: 18, fontWeight: fontWeight.regular, fontFamily: bodyFont.regular},
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
    fontFamily: bodyFont.semibold,
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    fontFamily: bodyFont.semibold,
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
