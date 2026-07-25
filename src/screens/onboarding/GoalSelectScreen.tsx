import {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Card, Screen, Text} from '@/components';
import {DAILY_GOAL_OPTIONS} from '@/constants';
import {useUpdateProfile} from '@/hooks';
import {useTheme} from '@/providers';
import {formatMinutes} from '@/utils';
import type {OnboardingStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GoalSelect'>;

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
    <Screen scroll>
      <View style={{gap: theme.spacing.base}}>
        <Text variant="h1">Daily goal</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Consistency beats intensity. Start small.
        </Text>

        {DAILY_GOAL_OPTIONS.map(option => {
          const isActive = minutes === option;
          return (
            <Pressable key={option} onPress={() => setMinutes(option)}>
              <Card
                style={{
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  borderWidth: isActive ? 2 : 1,
                }}>
                <Text variant="bodyStrong">{formatMinutes(option)} a day</Text>
              </Card>
            </Pressable>
          );
        })}

        <Button
          label="Continue"
          loading={updateProfile.isPending}
          onPress={onContinue}
          style={{marginTop: theme.spacing.base}}
        />
      </View>
    </Screen>
  );
};
