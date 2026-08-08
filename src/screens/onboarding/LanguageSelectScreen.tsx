import {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Button, OptionRow, Screen, StepHeader, Text} from '@/components';
import {
  AVAILABLE_LEARNING_CODES,
  DEFAULT_LEARNING_LANGUAGE,
  LEARNING_LANGUAGES,
  NATIVE_LANGUAGES,
} from '@/constants';
import {useUpdateProfile} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import type {OnboardingStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'LanguageSelect'>;

const isAvailable = (code: string) =>
  (AVAILABLE_LEARNING_CODES as readonly string[]).includes(code);

export const LanguageSelectScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {profile} = useAuth();
  const updateProfile = useUpdateProfile();

  const [learning, setLearning] = useState(
    profile?.learning_language ?? DEFAULT_LEARNING_LANGUAGE,
  );
  const [native, setNative] = useState(profile?.native_language ?? 'tr');

  const onContinue = async () => {
    await updateProfile.mutateAsync({learning_language: learning, native_language: native});
    navigation.navigate('LevelSelect');
  };

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <StepHeader
          step={1}
          total={4}
          title="Which language?"
          subtitle="Pick what you want to learn, and the language we should explain things in."
        />

        <View style={{gap: theme.spacing.md}}>
          <Text variant="overline" color={theme.colors.textTertiary}>
            I want to learn
          </Text>
          {LEARNING_LANGUAGES.map(option => (
            <OptionRow
              key={option.code}
              title={option.nativeName}
              description={isAvailable(option.code) ? option.englishName : 'Content coming soon'}
              selected={learning === option.code}
              onPress={() => isAvailable(option.code) && setLearning(option.code)}
              leading={
                <Text variant="h3" style={{opacity: isAvailable(option.code) ? 1 : 0.5}}>
                  {option.flag}
                </Text>
              }
            />
          ))}
        </View>

        <View style={{gap: theme.spacing.md}}>
          <Text variant="overline" color={theme.colors.textTertiary}>
            My language
          </Text>
          {NATIVE_LANGUAGES.map(option => (
            <OptionRow
              key={option.code}
              title={option.nativeName}
              description={option.englishName}
              selected={native === option.code}
              onPress={() => setNative(option.code)}
              leading={<Text variant="h3">{option.flag}</Text>}
            />
          ))}
        </View>

        {!isAvailable(learning) && <Badge label="Not available yet" tone="warning" />}

        <Button
          label="Continue"
          size="lg"
          disabled={!isAvailable(learning)}
          loading={updateProfile.isPending}
          onPress={onContinue}
        />
      </View>
    </Screen>
  );
};
