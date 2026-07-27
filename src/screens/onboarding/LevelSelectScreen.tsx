import {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Button, OptionRow, Screen, StepHeader} from '@/components';
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
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <StepHeader
          step={2}
          total={4}
          title="What's your level?"
          subtitle="Pick the one that feels closest. You can change it any time."
        />

        <View style={{gap: theme.spacing.md}}>
          {CEFR_LEVELS.map(level => (
            <OptionRow
              key={level}
              title={CEFR_LABELS[level].title}
              description={CEFR_LABELS[level].description}
              selected={selected === level}
              onPress={() => setSelected(level)}
              leading={<Badge label={level} tone="primary" solid={selected === level} />}
            />
          ))}
        </View>

        <Button
          label="Continue"
          size="lg"
          loading={updateProfile.isPending}
          onPress={onContinue}
        />
      </View>
    </Screen>
  );
};
