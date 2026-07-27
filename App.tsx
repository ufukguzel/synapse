/**
 * Synapse - language learning app
 * @format
 */
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ErrorBoundary} from '@/components';
import {RootNavigator} from '@/navigation';
import {AuthProvider, QueryProvider, ThemeProvider, useTheme} from '@/providers';

/**
 * The bar style has to follow the *app* theme, not the device one: the brand
 * theme is dark regardless of the system setting, so reading useColorScheme here
 * painted dark status-bar text onto a deep-space background on light devices.
 */
const ThemedStatusBar = () => {
  const theme = useTheme();
  return <StatusBar barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'} />;
};

const App = () => (
  <GestureHandlerRootView style={{flex: 1}}>
    {/* Outermost, so a crash in any provider still renders a recoverable screen. */}
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ThemedStatusBar />
              <RootNavigator />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  </GestureHandlerRootView>
);

export default App;
