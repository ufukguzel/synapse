import {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Button, Card, EmptyState, ErrorView, LoadingView, ProgressBar, Screen, Text} from '@/components';
import {vocabularyApi} from '@/api';
import {useDueVocabulary} from '@/hooks';
import {useTheme} from '@/providers';
import {scheduleNextReview} from '@/utils';

const QUALITY_BUTTONS = [
  {label: 'Again', quality: 1, variant: 'danger' as const},
  {label: 'Hard', quality: 3, variant: 'secondary' as const},
  {label: 'Good', quality: 4, variant: 'primary' as const},
  {label: 'Easy', quality: 5, variant: 'ghost' as const},
];

export const VocabularyReviewScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const dueQuery = useDueVocabulary();
  const saveReview = useMutation({mutationFn: vocabularyApi.saveReview});

  if (dueQuery.isLoading) {
    return <LoadingView />;
  }
  if (dueQuery.isError) {
    return <ErrorView error={dueQuery.error} onRetry={dueQuery.refetch} />;
  }

  const items = dueQuery.data ?? [];
  const current = items[index];

  if (!items.length) {
    return (
      <EmptyState
        title="All caught up"
        description="No words are due for review right now. Come back later."
        actionLabel="Go back"
        onAction={navigation.goBack}
      />
    );
  }

  if (!current) {
    return (
      <EmptyState
        title="Review finished"
        description={`You reviewed ${items.length} words.`}
        actionLabel="Done"
        onAction={navigation.goBack}
      />
    );
  }

  const onGrade = async (quality: number) => {
    const next = scheduleNextReview(
      {
        easeFactor: current.ease_factor,
        intervalDays: current.interval_days,
        repetitions: current.repetitions,
      },
      quality,
    );
    await saveReview.mutateAsync({id: current.id, ...next});
    setRevealed(false);
    setIndex(prev => prev + 1);
  };

  const word = current.vocabulary_items;

  return (
    <Screen>
      <ProgressBar value={index / items.length} style={{marginBottom: theme.spacing.lg}} />

      <Card style={{flex: 1, justifyContent: 'center', gap: theme.spacing.md}}>
        <Text variant="display" center>
          {word?.headword ?? '—'}
        </Text>
        {!!word?.phonetic && (
          <Text variant="body" center color={theme.colors.textSecondary}>
            {word.phonetic}
          </Text>
        )}
        {revealed && (
          <View style={{gap: theme.spacing.sm, marginTop: theme.spacing.base}}>
            <Text variant="bodyLg" center>
              {word?.meaning}
            </Text>
            {!!word?.translation && (
              <Text variant="body" center color={theme.colors.textSecondary}>
                {word.translation}
              </Text>
            )}
            {!!word?.example_sentence && (
              <Text variant="caption" center color={theme.colors.textTertiary}>
                "{word.example_sentence}"
              </Text>
            )}
          </View>
        )}
      </Card>

      <View style={{gap: theme.spacing.sm, paddingTop: theme.spacing.lg}}>
        {revealed ? (
          <View style={{flexDirection: 'row', gap: theme.spacing.sm}}>
            {QUALITY_BUTTONS.map(button => (
              <Button
                key={button.label}
                label={button.label}
                variant={button.variant}
                size="sm"
                fullWidth={false}
                style={{flex: 1}}
                loading={saveReview.isPending}
                onPress={() => onGrade(button.quality)}
              />
            ))}
          </View>
        ) : (
          <Button label="Show answer" onPress={() => setRevealed(true)} />
        )}
      </View>
    </Screen>
  );
};
