import {View} from 'react-native';
import {ProgressBar, Text} from '@/components/ui';
import {useTheme} from '@/providers';

export interface StepHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
}

/** Onboarding step heading - tells the learner how much is left. */
export const StepHeader = ({step, total, title, subtitle}: StepHeaderProps) => {
  const theme = useTheme();

  return (
    <View style={{gap: theme.spacing.md}}>
      <ProgressBar value={step / total} height={8} />
      <Text variant="overline" color={theme.colors.textTertiary}>
        Step {step} of {total}
      </Text>
      <Text variant="display">{title}</Text>
      {!!subtitle && (
        <Text variant="bodyLg" color={theme.colors.textSecondary}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};
