import {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, OptionRow, Screen, StepHeader} from '@/components';
import {DAILY_GOAL_OPTIONS} from '@/constants';
import {useUpdateProfile} from '@/hooks';
import {useT, useTheme} from '@/providers';
import type {TranslationKey} from '@/i18n';
import type {OnboardingStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GoalSelect'>;

export const GoalSelectScreen = () => {
  const theme = useTheme();
  const {t, formatMinutes} = useT();
  const navigation = useNavigation<Nav>();
  const updateProfile = useUpdateProfile();
  const [minutes, setMinutes] = useState<number>(10);

  const onContinue = async () => {
    await updateProfile.mutateAsync({daily_goal_minutes: minutes});
    navigation.navigate('ReminderSetup');
  };

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <StepHeader
          step={3}
          total={4}
          title={t('onb.goal.title')}
          subtitle={t('onb.goal.subtitle')}
        />

        <View style={{gap: theme.spacing.md}}>
          {DAILY_GOAL_OPTIONS.map(option => (
            <OptionRow
              key={option}
              title={t('settings.goalPerDay', {minutes: formatMinutes(option)})}
              description={t(`onb.goal.hint${option}` as TranslationKey)}
              selected={minutes === option}
              onPress={() => setMinutes(option)}
            />
          ))}
        </View>

        <Button
          label={t('onb.continue')}
          size="lg"
          loading={updateProfile.isPending}
          onPress={onContinue}
        />
      </View>
    </Screen>
  );
};
