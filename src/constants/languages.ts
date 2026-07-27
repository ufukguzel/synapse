/**
 * Languages the learner can study, and the languages the interface itself speaks.
 *
 * These are separate axes on purpose: someone can study English *through* a
 * Turkish interface. `learning` drives content selection, `ui` only affects
 * labels.
 */
export interface LanguageOption {
  code: string;
  /** Name in the language itself - how speakers expect to see it listed. */
  nativeName: string;
  /** English name, for the secondary line. */
  englishName: string;
  flag: string;
}

/** Languages available to learn. English is the only one with content today. */
export const LEARNING_LANGUAGES: LanguageOption[] = [
  {code: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧'},
  {code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪'},
  {code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸'},
  {code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷'},
  {code: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹'},
  {code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺'},
  {code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦'},
  {code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵'},
];

/** Interface languages. */
export const UI_LANGUAGES: LanguageOption[] = [
  {code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷'},
  {code: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧'},
];

/** Languages the learner may pick as their own first language. */
export const NATIVE_LANGUAGES: LanguageOption[] = [
  {code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷'},
  {code: 'en', nativeName: 'English', englishName: 'English', flag: '🇬🇧'},
  {code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪'},
  {code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸'},
  {code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦'},
];

/** Content exists only for these; the rest are shown as coming soon. */
export const AVAILABLE_LEARNING_CODES = ['en'] as const;

export const DEFAULT_LEARNING_LANGUAGE = 'en';
export const DEFAULT_UI_LANGUAGE = 'tr';

export const findLanguage = (list: LanguageOption[], code: string | null | undefined) =>
  list.find(item => item.code === code);
