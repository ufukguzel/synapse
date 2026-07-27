import type {ReactNode} from 'react';
import {Pressable, Switch, View} from 'react-native';
import {Text} from '@/components/ui';
import {useTheme} from '@/providers';

interface BaseProps {
  label: string;
  description?: string;
  /** Leading glyph or icon. */
  icon?: string;
}

export interface SettingsNavRowProps extends BaseProps {
  /** Current selection, shown on the right. */
  value?: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Row that opens a detail screen or picker. */
export const SettingsNavRow = ({
  label,
  description,
  icon,
  value,
  onPress,
  disabled,
}: SettingsNavRowProps) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}>
      {!!icon && <Text variant="bodyLg">{icon}</Text>}
      <View style={{flex: 1, gap: theme.spacing.xxs}}>
        <Text variant="bodyStrong">{label}</Text>
        {!!description && (
          <Text variant="caption" color={theme.colors.textTertiary}>
            {description}
          </Text>
        )}
      </View>
      {!!value && (
        <Text variant="body" color={theme.colors.textSecondary}>
          {value}
        </Text>
      )}
      <Text variant="body" color={theme.colors.textTertiary}>
        ›
      </Text>
    </Pressable>
  );
};

export interface SettingsToggleRowProps extends BaseProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

/** Row with an inline switch. */
export const SettingsToggleRow = ({
  label,
  description,
  icon,
  value,
  onValueChange,
  disabled,
}: SettingsToggleRowProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        opacity: disabled ? 0.5 : 1,
      }}>
      {!!icon && <Text variant="bodyLg">{icon}</Text>}
      <View style={{flex: 1, gap: theme.spacing.xxs}}>
        <Text variant="bodyStrong">{label}</Text>
        {!!description && (
          <Text variant="caption" color={theme.colors.textTertiary}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{false: theme.colors.borderStrong, true: theme.colors.primary}}
        thumbColor={theme.colors.text}
      />
    </View>
  );
};

export interface SettingsGroupProps {
  title?: string;
  children: ReactNode;
  footer?: string;
}

/** Titled card grouping related rows, with hairlines between them. */
export const SettingsGroup = ({title, children, footer}: SettingsGroupProps) => {
  const theme = useTheme();

  return (
    <View style={{gap: theme.spacing.sm}}>
      {!!title && (
        <Text variant="overline" color={theme.colors.textTertiary}>
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing.base,
        }}>
        {children}
      </View>
      {!!footer && (
        <Text variant="caption" color={theme.colors.textTertiary}>
          {footer}
        </Text>
      )}
    </View>
  );
};
