import {useState} from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, OptionRow, Screen, StepHeader} from '@/components';
import {DAILY_GOAL_OPTIONS} from '@/constants';
import {useUpdateProfile} from '@/hooks';
import {useTheme} from '@/providers';
import {formatMinutes} from '@/utils';
import type {OnboardingStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GoalSelect'>;

/** Keyed by the minute values in DAILY_GOAL_OPTIONS. */
const GOAL_HINTS: Record<number, string> = {
  5: 'One short session - easiest to keep up.',
  10: 'The sweet spot for most learners.',
  15: 'Steady progress without a big time commitment.',
  20: 'Two sessions a day, or one longer one.',
  30: 'Serious pace. Best if you already have a routine.',
};

export const GoalSelectScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const updateProfile = useUpdateProfile();
  const [minutes, setMinutes] = useState<number>(10);

  const onContinue = async () => {
    await updateProfile.mutateAsync({daily_goal_minutes: minutes});
    navigation.navigate('ReminderSetup');
  };

  return (
    <Screen>
      <StepHeader
        step={3}
        total={4}
        title="Daily goal"
        subtitle="Consistency beats intensity. Start small."
      />

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{gap: theme.spacing.md, paddingVertical: theme.spacing.lg}}>
        {DAILY_GOAL_OPTIONS.map(option => (
          <OptionRow
            key={option}
            title={`${formatMinutes(option)} a day`}
            description={GOAL_HINTS[option]}
            selected={minutes === option}
            onPress={() => setMinutes(option)}
          />
        ))}
      </ScrollView>

      <Button
        label="Continue"
        size="lg"
        loading={updateProfile.isPending}
        onPress={onContinue}
        style={{marginTop: theme.spacing.sm}}
      />
    </Screen>
  );
};
