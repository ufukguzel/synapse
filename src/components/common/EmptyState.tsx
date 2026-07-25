import {StyleSheet, View} from 'react-native';
import {useTheme} from '@/providers';
import {Button, Text} from '@/components/ui';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({title, description, actionLabel, onAction}: EmptyStateProps) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, {gap: theme.spacing.sm, padding: theme.spacing.xl}]}>
      <Text variant="h3" center>
        {title}
      </Text>
      {!!description && (
        <Text variant="body" center color={theme.colors.textSecondary}>
          {description}
        </Text>
      )}
      {!!actionLabel && (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} style={{marginTop: theme.spacing.md}} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
