import {en, type TranslationKey} from './en';
import {tr} from './tr';

export type {TranslationKey} from './en';

/** Interface locales the app actually renders in (a subset of UI_LANGUAGES). */
export type Locale = 'en' | 'tr';

export const DEFAULT_LOCALE: Locale = 'tr';

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {en, tr};

export type TransParams = Record<string, string | number>;

/** Fills `{token}` placeholders from params; leaves unknown tokens untouched. */
const interpolate = (template: string, params?: TransParams) => {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, token) =>
    token in params ? String(params[token]) : match,
  );
};

/** Narrows any stored ui_language string to a locale we can actually render. */
export const resolveLocale = (code: string | null | undefined): Locale =>
  code === 'en' || code === 'tr' ? code : DEFAULT_LOCALE;

/** Translate a static key. Falls back to English, then the raw key, if missing. */
export const translate = (locale: Locale, key: TranslationKey, params?: TransParams): string => {
  const template = DICTIONARIES[locale][key] ?? en[key] ?? key;
  return interpolate(template, params);
};

/**
 * Translate a counted key by appending `_one` / `_other`. English uses the
 * singular only at exactly 1; Turkish keeps a single form, so both variants map
 * to the same string there. `count` is injected automatically.
 */
export const translateCount = (
  locale: Locale,
  base: string,
  count: number,
  params?: TransParams,
): string => {
  const suffix = count === 1 ? '_one' : '_other';
  const key = `${base}${suffix}` as TranslationKey;
  return translate(locale, key, {count, ...params});
};

/** Locale-aware minute/hour formatting - replaces the English-only util in UI. */
export const formatDuration = (locale: Locale, minutes: number): string => {
  if (minutes < 60) {
    return translate(locale, 'units.minutes', {count: minutes});
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? translate(locale, 'units.hours', {count: hours})
    : translate(locale, 'units.hoursMinutes', {hours, minutes: rest});
};
