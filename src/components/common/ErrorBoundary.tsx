import {Component, type ErrorInfo, type ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from '@/providers';
import {Button, Text} from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Shown when a render throws — themed, standalone (no navigation needed). */
const ErrorBoundaryFallback = ({error, onReset}: {error: Error; onReset: () => void}) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.background, padding: theme.spacing.xl, gap: theme.spacing.md},
      ]}>
      <Text variant="display" center>
        😵‍💫
      </Text>
      <Text variant="h2" center>
        Something went wrong
      </Text>
      <Text variant="body" center color={theme.colors.textSecondary}>
        The app hit an unexpected error. You can try again — your progress is saved.
      </Text>
      {__DEV__ && (
        <Text variant="caption" center color={theme.colors.textTertiary}>
          {error.message}
        </Text>
      )}
      <Button label="Try again" onPress={onReset} fullWidth={false} testID="error-reload" />
    </View>
  );
};

/**
 * Catches render errors anywhere below it and shows a recovery screen instead
 * of a white screen / crash. Wraps the whole app in App.tsx.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Wire a crash reporter (Sentry, Bugsnag, …) here before launch.
    console.error('[Synapse] Uncaught render error', error, info.componentStack);
  }

  reset = () => this.setState({error: null});

  render() {
    if (this.state.error) {
      return <ErrorBoundaryFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
