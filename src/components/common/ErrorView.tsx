import {StyleSheet, View} from 'react-native';
import {useT, useTheme} from '@/providers';
import {Button, Text} from '@/components/ui';

export interface ErrorViewProps {
  error?: unknown;
  onRetry?: () => void;
}

export const ErrorView = ({error, onRetry}: ErrorViewProps) => {
  const theme = useTheme();
  const {t} = useT();
  // A real API message is more useful than a generic line, so keep it when present.
  const message = error instanceof Error ? error.message : t('error.generic');
  return (
    <View style={[styles.container, {gap: theme.spacing.md, padding: theme.spacing.xl}]}>
      <Text variant="h2" center>
        {t('error.title')}
      </Text>
      <Text variant="body" center color={theme.colors.textSecondary}>
        {message}
      </Text>
      {!!onRetry && (
        <Button
          label={t('error.retry')}
          onPress={onRetry}
          fullWidth={false}
          style={{marginTop: theme.spacing.sm}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  iconTile: {width: 88, height: 88, alignItems: 'center', justifyContent: 'center'},
});
