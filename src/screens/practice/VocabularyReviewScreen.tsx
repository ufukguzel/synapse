import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Button, Card, EmptyState, ErrorView, LoadingView, ProgressBar, Screen, Text} from '@/components';
import {vocabularyApi} from '@/api';
import {useCompleteTask, useDueVocabulary, useRecordActivity} from '@/hooks';
import {useTheme} from '@/providers';
import {scheduleNextReview} from '@/utils';
import type {RootStackParamList} from '@/navigation/types';

type Route = RouteProp<RootStackParamList, 'VocabularyReview'>;

const QUALITY_BUTTONS = [
  {label: 'Again', quality: 1, variant: 'danger' as const},
  {label: 'Hard', quality: 3, variant: 'secondary' as const},
  {label: 'Good', quality: 4, variant: 'primary' as const},
  {label: 'Easy', quality: 5, variant: 'ghost' as const},
];

/** Modest XP per word - well under a lesson's, so review can't outpace lessons. */
const XP_PER_WORD = 2;

export const VocabularyReviewScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {params} = useRoute<Route>();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const dueQuery = useDueVocabulary();
  const saveReview = useMutation({mutationFn: vocabularyApi.saveReview});
  const recordActivity = useRecordActivity();
  const completeTask = useCompleteTask();

  const items = dueQuery.data ?? [];
  const current = items[index];
  const finished = items.length > 0 && index >= items.length;

  // All hooks run unconditionally, before the loading/empty/finished branches
  // below return early - a session-elapsed timer and a once-only guard.
  const sessionStartRef = useRef(Date.now());
  const recordedRef = useRef(false);

  useEffect(() => {
    if (!finished || recordedRef.current) {
      return;
    }
    recordedRef.current = true;
    // Nothing called record_activity for a review session before this, so
    // reviewing words never moved the streak or the daily goal no matter how
    // long it took.
    const minutes = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60_000));
    recordActivity.mutate({minutes, xp: items.length * XP_PER_WORD, lessons: 0});
    // Opened from the Tasks tab: close the task too, same as a lesson does.
    if (params?.taskId) {
      completeTask.mutate(params.taskId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (dueQuery.isLoading) {
    return <LoadingView />;
  }
  if (dueQuery.isError) {
    return <ErrorView error={dueQuery.error} onRetry={dueQuery.refetch} />;
  }

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
