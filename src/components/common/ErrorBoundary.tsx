import {Component, type ErrorInfo, type ReactNode} from 'react';
import {View} from 'react-native';
import {Button, Text} from '@/components/ui';
import {darkColors, radius, spacing} from '@/theme';

interface Props {
  children: ReactNode;
  /** Hook for a crash reporter once one is wired up. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes below it.
 *
 * Without this a single thrown error in any screen unmounts the whole tree and
 * leaves a blank white screen with no way back - the worst possible failure mode,
 * because the user cannot even report what they were doing.
 *
 * Styling comes from the raw tokens rather than useTheme: the provider itself may
 * be part of what failed, and the fallback has to render regardless.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // Keep the stack in the dev console; a reporter replaces this in production.
    console.error('[Synapse] uncaught render error', error, info.componentStack);
  }

  private reset = () => this.setState({error: null});

  render() {
    const {error} = this.state;
    if (!error) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: darkColors.background,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          gap: spacing.md,
        }}>
        <Text variant="h2" center color={darkColors.text}>
          Something interrupted us
        </Text>
        <Text variant="body" center color={darkColors.textSecondary}>
          Your progress is saved. Try again, and if it keeps happening a restart
          will clear it.
        </Text>

        <View
          style={{
            backgroundColor: darkColors.surface,
            borderRadius: radius.card,
            padding: spacing.md,
            alignSelf: 'stretch',
          }}>
          <Text variant="caption" color={darkColors.textTertiary}>
            {error.message || 'Unknown error'}
          </Text>
        </View>

        <Button label="Try again" onPress={this.reset} fullWidth={false} />
      </View>
    );
  }
}
