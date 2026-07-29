/**
 * Synapse - English learning app
 * @format
 */
import {StatusBar, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ErrorBoundary} from '@/components';
import {RootNavigator} from '@/navigation';
import {AuthProvider, QueryProvider, ThemeProvider} from '@/providers';

const App = () => {
  const isDark = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <RootNavigator />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
