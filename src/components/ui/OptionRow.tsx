import type {ReactNode} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme} from '@/providers';
import {Text} from './Text';

export interface OptionRowProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** Rendered before the title - a Badge, emoji or icon. */
  leading?: ReactNode;
}

/**
 * Selectable card used by the onboarding steps. Selection is carried by the fill
 * and an explicit check mark, not by a 1px-to-2px border change, which is close
 * to invisible on a light background.
 */
export const OptionRow = ({title, description, selected, onPress, leading}: OptionRowProps) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{selected}}
      onPress={onPress}
      style={({pressed}) => ({
        backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        borderWidth: 2,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.base,
        gap: theme.spacing.xs,
        opacity: pressed ? 0.9 : 1,
      })}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm}}>
        {leading}
        <Text variant="bodyStrong" style={{flex: 1}}>
          {title}
        </Text>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: theme.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? theme.colors.primary : 'transparent',
            borderWidth: selected ? 0 : 2,
            borderColor: theme.colors.borderStrong,
          }}>
          {selected && (
            <Text variant="caption" color={theme.colors.onPrimary}>
              ✓
            </Text>
          )}
        </View>
      </View>
      {!!description && (
        <Text variant="caption" color={theme.colors.textSecondary}>
          {description}
        </Text>
      )}
    </Pressable>
  );
};
