import {View} from 'react-native';
import {useTheme} from '@/providers';
import {Text} from './Text';

export interface StatChipProps {
  value: string;
  label?: string;
  /** Use on top of a gradient, where the surface colours would disappear. */
  onGradient?: boolean;
  /** Tints the value - for the streak and reward chips. */
  tone?: 'default' | 'spark' | 'active';
}

/**
 * Compact stat pill for streaks, XP and goals.
 *
 * Text only, no emoji: the brand chips are plain labels ("B1", "12-day",
 * "Speaking") and the voice guide rules out the flame/party dressing that makes
 * a learning app read like a game show.
 */
export const StatChip = ({value, label, onGradient = false, tone = 'default'}: StatChipProps) => {
  const theme = useTheme();

  const valueColor = onGradient
    ? theme.brand.mist
    : tone === 'spark'
    ? theme.colors.accent
    : tone === 'active'
    ? theme.colors.success
    : theme.colors.text;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: onGradient ? 'rgba(236, 234, 254, 0.16)' : theme.colors.surfaceAlt,
      }}>
      <Text variant="bodyStrong" color={valueColor}>
        {value}
      </Text>
      {!!label && (
        <Text
          variant="caption"
          color={onGradient ? 'rgba(236, 234, 254, 0.8)' : theme.colors.textSecondary}>
          {label}
        </Text>
      )}
    </View>
  );
};
