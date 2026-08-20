import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Card, Screen, StatChip, Text} from '@/components';
import {useAvailableVocabulary, useDueVocabulary, useEnrollVocabulary} from '@/hooks';
import {useAuth, useT, useTheme} from '@/providers';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BATCH_SIZE = 10;

export const PracticeScreen = () => {
  const theme = useTheme();
  const {t, tc} = useT();
  const navigation = useNavigation<Nav>();
  const {profile} = useAuth();

  const due = useDueVocabulary();
  const available = useAvailableVocabulary(profile?.current_level, BATCH_SIZE);
  const enroll = useEnrollVocabulary();

  const dueCount = due.data?.length ?? 0;
  const availableWords = available.data ?? [];

  const onAddWords = () => {
    if (!availableWords.length) {
      return;
    }
    enroll.mutate(availableWords.map(word => word.id));
  };

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <Text variant="display">{t('practice.title')}</Text>

        <Card gradient="brand" style={{gap: theme.spacing.base}}>
          <Text variant="h3" color={theme.palette.white}>
            {t('practice.vocabReview')}
          </Text>
          <Text variant="body" color="rgba(255, 255, 255, 0.85)">
            {t('practice.srsBlurb')}
          </Text>
          <View style={{flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap'}}>
            <StatChip value={String(dueCount)} label={t('practice.dueNow')} onGradient />
            <StatChip value={String(availableWords.length)} label={t('practice.new')} onGradient />
          </View>
          <Button
            label={dueCount > 0 ? tc('practice.reviewWords', dueCount) : t('practice.nothingDue')}
            variant="secondary"
            disabled={dueCount === 0}
            loading={due.isLoading}
            onPress={() => navigation.navigate('VocabularyReview')}
          />
        </Card>

        <Card style={{gap: theme.spacing.md}}>
          <Text variant="h3">{t('practice.addNewWords')}</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            {availableWords.length > 0
              ? tc('practice.wordsReady', availableWords.length, {
                  level: profile?.current_level ?? 'A1',
                })
              : t('practice.allStarted')}
          </Text>
          <Button
            label={
              availableWords.length > 0
                ? tc('practice.addToReview', availableWords.length)
                : t('practice.nothingToAdd')
            }
            disabled={availableWords.length === 0}
            loading={enroll.isPending || available.isLoading}
            onPress={onAddWords}
          />
          {enroll.isError && (
            <Text variant="caption" color={theme.colors.danger}>
              {t('practice.addError')}
            </Text>
          )}
        </Card>
      </View>
    </Screen>
  );
};
