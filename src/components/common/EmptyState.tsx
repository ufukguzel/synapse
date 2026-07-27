import {StyleSheet, View} from 'react-native';
import {useTheme} from '@/providers';
import {Button, Text} from '@/components/ui';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional glyph above the title. Omit for the plain, calm variant. */
  icon?: string;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, {gap: theme.spacing.md, padding: theme.spacing.xl}]}>
      {!!icon && (
        <View
          style={[
            styles.iconTile,
            {backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.xxl},
          ]}>
          <Text variant="display">{icon}</Text>
        </View>
      )}
      <Text variant="h2" center>
        {title}
      </Text>
      {!!description && (
        <Text variant="bodyLg" center color={theme.colors.textSecondary}>
          {description}
        </Text>
      )}
      {!!actionLabel && (
        <Button
          label={actionLabel}
          onPress={onAction}
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
