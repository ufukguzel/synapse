import {View} from 'react-native';
import {useTheme} from '@/providers';
import {Text} from './Text';

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}

export const Badge = ({label, tone = 'neutral'}: BadgeProps) => {
  const theme = useTheme();
  const map = {
    neutral: {bg: theme.colors.surfaceAlt, fg: theme.colors.textSecondary},
    primary: {bg: theme.colors.primarySoft, fg: theme.colors.primary},
    success: {bg: theme.colors.successSoft, fg: theme.colors.success},
    warning: {bg: theme.colors.warningSoft, fg: theme.colors.warning},
    danger: {bg: theme.colors.dangerSoft, fg: theme.colors.danger},
  } as const;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: map[tone].bg,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.radius.pill,
      }}>
      <Text variant="overline" color={map[tone].fg}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};
