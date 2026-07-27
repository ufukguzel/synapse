import type {ReactNode} from 'react';
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/constants';
import {AppTheme, buildTheme} from '@/theme';

/** 'brand' means always dark - the identity only specifies a dark theme. */
export type ThemePreference = 'brand' | 'light' | 'system';

interface ThemeContextValue extends AppTheme {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const DEFAULT_PREFERENCE: ThemePreference = 'brand';

const ThemeContext = createContext<ThemeContextValue>({
  ...buildTheme('dark'),
  preference: DEFAULT_PREFERENCE,
  setPreference: () => {},
});

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_PREFERENCE);

  // Restore the saved choice; the brand dark theme shows until it loads.
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEYS.themeScheme)
      .then(stored => {
        if (mounted && (stored === 'brand' || stored === 'light' || stored === 'system')) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        // A missing preference is not worth surfacing - the default is correct.
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEYS.themeScheme, next).catch(() => {});
  }, []);

  const scheme =
    preference === 'light'
      ? 'light'
      : preference === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({...buildTheme(scheme), preference, setPreference}),
    [scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
