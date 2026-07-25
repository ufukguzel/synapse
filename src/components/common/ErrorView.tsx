import {StyleSheet, View} from 'react-native';
import {useTheme} from '@/providers';
import {Button, Text} from '@/components/ui';

export interface ErrorViewProps {
  error?: unknown;
  onRetry?: () => void;
}

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export const ErrorView = ({error, onRetry}: ErrorViewProps) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, {gap: theme.spacing.md, padding: theme.spacing.xl}]}>
      <Text variant="h3" center>
        Oops
      </Text>
      <Text variant="body" center color={theme.colors.textSecondary}>
        {messageOf(error)}
      </Text>
      {!!onRetry && <Button label="Try again" onPress={onRetry} fullWidth={false} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
