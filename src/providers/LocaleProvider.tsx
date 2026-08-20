import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/constants';
import {
  DEFAULT_LOCALE,
  formatDuration,
  resolveLocale,
  translate,
  translateCount,
  type Locale,
  type TranslationKey,
  type TransParams,
} from '@/i18n';
import {useAuth} from './AuthProvider';

interface LocaleContextValue {
  locale: Locale;
  /** Translate a static key, filling any `{token}` placeholders. */
  t: (key: TranslationKey, params?: TransParams) => string;
  /** Translate a counted key (base + `_one`/`_other`), injecting `count`. */
  tc: (base: string, count: number, params?: TransParams) => string;
  /** Locale-aware "5 min" / "1 h 5 min". */
  formatMinutes: (minutes: number) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: key => translate(DEFAULT_LOCALE, key),
  tc: (base, count, params) => translateCount(DEFAULT_LOCALE, base, count, params),
  formatMinutes: minutes => formatDuration(DEFAULT_LOCALE, minutes),
});

/**
 * Drives the interface language from the signed-in profile's ui_language.
 *
 * The choice is cached so a returning user sees their language immediately,
 * before the profile round-trips - otherwise every cold start would flash the
 * default locale on the auth and loading screens. Must sit inside AuthProvider.
 */
export const LocaleProvider = ({children}: {children: ReactNode}) => {
  const {profile} = useAuth();
  const [cached, setCached] = useState<Locale | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEYS.uiLanguage)
      .then(stored => {
        if (mounted && (stored === 'en' || stored === 'tr')) {
          setCached(stored);
        }
      })
      .catch(() => {
        // A missing cache just means we use the default until the profile loads.
      });
    return () => {
      mounted = false;
    };
  }, []);

  // The profile is authoritative once loaded; the cache only covers the gap
  // before it arrives.
  const locale = profile?.ui_language
    ? resolveLocale(profile.ui_language)
    : cached ?? DEFAULT_LOCALE;

  useEffect(() => {
    if (profile?.ui_language) {
      const resolved = resolveLocale(profile.ui_language);
      setCached(resolved);
      AsyncStorage.setItem(STORAGE_KEYS.uiLanguage, resolved).catch(() => {});
    }
  }, [profile?.ui_language]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: (key, params) => translate(locale, key, params),
      tc: (base, count, params) => translateCount(locale, base, count, params),
      formatMinutes: minutes => formatDuration(locale, minutes),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

/** Access the active locale and its translators. */
export const useT = (): LocaleContextValue => useContext(LocaleContext);
