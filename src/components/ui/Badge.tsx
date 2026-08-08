import {View} from 'react-native';
import {useTheme} from '@/providers';
import {Text} from './Text';

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  /** Solid badges carry more weight - use for level chips and streak counts. */
  solid?: boolean;
}

export const Badge = ({label, tone = 'neutral', solid = false}: BadgeProps) => {
  const theme = useTheme();

  const soft = {
    neutral: {bg: theme.colors.surfaceAlt, fg: theme.colors.textSecondary},
    primary: {bg: theme.colors.primarySoft, fg: theme.colors.primary},
    success: {bg: theme.colors.successSoft, fg: theme.colors.success},
    warning: {bg: theme.colors.warningSoft, fg: theme.colors.warning},
    danger: {bg: theme.colors.dangerSoft, fg: theme.colors.danger},
  } as const;

  const filled = {
    neutral: {bg: theme.colors.borderStrong, fg: theme.colors.text},
    primary: {bg: theme.colors.primary, fg: theme.colors.onPrimary},
    success: {bg: theme.colors.success, fg: theme.palette.white},
    warning: {bg: theme.colors.warning, fg: theme.palette.gray900},
    danger: {bg: theme.colors.danger, fg: theme.palette.white},
  } as const;

  const {bg, fg} = solid ? filled[tone] : soft[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.pill,
      }}>
      <Text variant="overline" color={fg}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};
