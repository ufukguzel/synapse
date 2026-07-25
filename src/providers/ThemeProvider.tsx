import type {ReactNode} from 'react';
import {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {AppTheme, buildTheme} from '@/theme';

const ThemeContext = createContext<AppTheme>(buildTheme('light'));

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const scheme = useColorScheme();
  const theme = useMemo(() => buildTheme(scheme === 'dark' ? 'dark' : 'light'), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): AppTheme => useContext(ThemeContext);
