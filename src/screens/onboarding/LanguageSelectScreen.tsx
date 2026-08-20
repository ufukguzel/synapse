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
import {useAuth, useT, useTheme} from '@/providers';
import type {OnboardingStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'LanguageSelect'>;

const isAvailable = (code: string) =>
  (AVAILABLE_LEARNING_CODES as readonly string[]).includes(code);

export const LanguageSelectScreen = () => {
  const theme = useTheme();
  const {t} = useT();
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
          title={t('onb.lang.title')}
          subtitle={t('onb.lang.subtitle')}
        />

        <View style={{gap: theme.spacing.md}}>
          <Text variant="overline" color={theme.colors.textTertiary}>
            {t('onb.lang.wantToLearn')}
          </Text>
          {LEARNING_LANGUAGES.map(option => (
            <OptionRow
              key={option.code}
              title={option.nativeName}
              description={isAvailable(option.code) ? option.englishName : t('onb.lang.comingSoon')}
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
            {t('onb.lang.myLanguage')}
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

        {!isAvailable(learning) && <Badge label={t('onb.lang.notAvailable')} tone="warning" />}

        <Button
          label={t('onb.continue')}
          size="lg"
          disabled={!isAvailable(learning)}
          loading={updateProfile.isPending}
          onPress={onContinue}
        />
      </View>
    </Screen>
  );
};
