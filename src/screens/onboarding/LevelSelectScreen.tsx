import {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Button, Card, Screen, Text} from '@/components';
import {CEFR_LABELS, CEFR_LEVELS} from '@/constants';
import {useUpdateProfile} from '@/hooks';
import {useTheme} from '@/providers';
import type {CefrLevel} from '@/types';
import type {OnboardingStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'LevelSelect'>;

export const LevelSelectScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<CefrLevel>('A1');

  const onContinue = async () => {
    await updateProfile.mutateAsync({current_level: selected, target_level: selected});
    navigation.navigate('GoalSelect');
  };

  return (
    <Screen scroll>
      <View style={{gap: theme.spacing.base}}>
        <Text variant="h1">What's your level?</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Pick the one that feels closest. You can change it any time.
        </Text>

        {CEFR_LEVELS.map(level => {
          const isActive = selected === level;
          return (
            <Pressable key={level} onPress={() => setSelected(level)}>
              <Card
                style={{
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  borderWidth: isActive ? 2 : 1,
                  gap: theme.spacing.xs,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm}}>
                  <Badge label={level} tone={isActive ? 'primary' : 'neutral'} />
                  <Text variant="bodyStrong">{CEFR_LABELS[level].title}</Text>
                </View>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  {CEFR_LABELS[level].description}
                </Text>
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
