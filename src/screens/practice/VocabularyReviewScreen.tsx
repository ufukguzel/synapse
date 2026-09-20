import {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Button, Card, EmptyState, ErrorView, LoadingView, ProgressBar, Screen, Text} from '@/components';
import {vocabularyApi, type DueReviewItem} from '@/api';
import {useDueVocabulary, useFavoriteVocabulary, useToggleFavorite} from '@/hooks';
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

export const VocabularyReviewScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {params} = useRoute<Route>();
  const mode = params?.mode ?? 'due';
  const isFavorites = mode === 'favorites';

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  // Snapshot of the queue, taken once, so the deck doesn't reshuffle mid-review
  // when a background refetch (e.g. after un-starring) changes the source list.
  const [queue, setQueue] = useState<DueReviewItem[] | null>(null);
  // Instant star state, keyed by row id; persistence happens in the background.
  const [favOverrides, setFavOverrides] = useState<Record<string, boolean>>({});

  const dueQuery = useDueVocabulary();
  const favQuery = useFavoriteVocabulary();
  const query = isFavorites ? favQuery : dueQuery;

  const saveReview = useMutation({mutationFn: vocabularyApi.saveReview});
  const toggleFavorite = useToggleFavorite();

  useEffect(() => {
    if (query.data && queue === null) {
      setQueue(query.data);
    }
  }, [query.data, queue]);

  if (query.isLoading && queue === null) {
    return <LoadingView />;
  }
  if (query.isError) {
    return <ErrorView error={query.error} onRetry={query.refetch} />;
  }

  const items = queue ?? [];
  const current = items[index];

  if (!items.length) {
    return (
      <EmptyState
        title={isFavorites ? 'No favorites yet' : 'All caught up'}
        description={
          isFavorites
            ? 'Star words during a review to build a set you can drill any time.'
            : 'No words are due for review right now. Come back later.'
        }
        actionLabel="Go back"
        onAction={navigation.goBack}
      />
    );
  }

  if (!current) {
    const noun = isFavorites ? 'favorite' : 'word';
    return (
      <EmptyState
        title="Review finished"
        description={`You reviewed ${items.length} ${noun}${items.length === 1 ? '' : 's'}.`}
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

  const isFavorite = favOverrides[current.id] ?? current.is_favorite;
  const onToggleFavorite = () => {
    const nextValue = !isFavorite;
    setFavOverrides(prev => ({...prev, [current.id]: nextValue}));
    toggleFavorite.mutate({id: current.id, isFavorite: nextValue});
  };

  const word = current.vocabulary_items;

  return (
    <Screen>
      <ProgressBar value={index / items.length} style={{marginBottom: theme.spacing.lg}} />

      <Card style={{flex: 1, justifyContent: 'center', gap: theme.spacing.md}}>
        {/* Star the word to keep it in a favorites set for later review. */}
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          style={({pressed}) => ({
            position: 'absolute',
            top: theme.spacing.base,
            right: theme.spacing.base,
            opacity: pressed ? 0.5 : 1,
          })}>
          <Text variant="h3">{isFavorite ? '⭐' : '☆'}</Text>
        </Pressable>

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
