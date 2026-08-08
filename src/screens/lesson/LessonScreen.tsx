import {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useMutation, useQuery} from '@tanstack/react-query';
import {
  EmptyState,
  ErrorView,
  ExerciseRenderer,
  LoadingView,
  ProgressBar,
  Screen,
  Text,
} from '@/components';
import {lessonsApi} from '@/api';
import {HEARTS_PER_SESSION} from '@/constants';
import {useLessonSession, useRecordActivity} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Lesson'>;
type Route = RouteProp<RootStackParamList, 'Lesson'>;

export const LessonScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();
  const {user} = useAuth();

  const exercisesQuery = useQuery({
    queryKey: ['exercises', params.lessonId],
    queryFn: () => lessonsApi.exercises(params.lessonId),
  });

  const session = useLessonSession(exercisesQuery.data ?? []);

  const lessonQuery = useQuery({
    queryKey: ['lesson', params.lessonId],
    queryFn: () => lessonsApi.get(params.lessonId),
  });

  const completeLesson = useMutation({
    mutationFn: (score: number) =>
      lessonsApi.complete({userId: user!.id, lessonId: params.lessonId, score}),
  });

  const recordActivity = useRecordActivity();

  useEffect(() => {
    // Running out of hearts ends the session too, otherwise the hearts counter is
    // decoration and a learner can miss every question and still finish.
    if (!session.isFinished && !session.isFailed) {
      return;
    }
    // A failed run is not a completed lesson, so don't record progress for it.
    if (session.isFinished && !session.isFailed && user?.id) {
      completeLesson.mutate(Math.round(session.accuracy * 100));
      // Feeds the streak, the XP total and today's goal bar. Without this the
      // gamification numbers stayed at zero no matter how much was studied.
      recordActivity.mutate({
        minutes: lessonQuery.data?.estimated_minutes ?? 0,
        xp: session.xp,
        lessons: 1,
      });
    }
    navigation.replace('LessonResult', {
      lessonId: params.lessonId,
      xp: session.xp,
      accuracy: session.accuracy,
      failed: session.isFailed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isFinished, session.isFailed]);

  if (exercisesQuery.isLoading) {
    return <LoadingView />;
  }
  if (exercisesQuery.isError) {
    return <ErrorView error={exercisesQuery.error} onRetry={exercisesQuery.refetch} />;
  }
  if (!session.exercises.length) {
    return (
      <EmptyState
        title="No exercises"
        description="This lesson has no content yet."
        actionLabel="Go back"
        onAction={navigation.goBack}
      />
    );
  }

  return (
    <Screen>
      <View style={{gap: theme.spacing.md, marginBottom: theme.spacing.xl}}>
        <View style={styles.topRow}>
          <ProgressBar value={session.progress} style={styles.flex} />
          {/* Spent hearts stay visible as dimmed glyphs so the cost is legible. */}
          <Text variant="bodyStrong">
            {'❤️'.repeat(session.hearts)}
            <Text variant="bodyStrong" color={theme.colors.textTertiary}>
              {'🤍'.repeat(Math.max(0, HEARTS_PER_SESSION - session.hearts))}
            </Text>
          </Text>
        </View>
        <Text variant="caption" color={theme.colors.textTertiary}>
          Question {Math.min(session.index + 1, session.exercises.length)} of{' '}
          {session.exercises.length}
        </Text>
      </View>

      {session.current && (
        <ExerciseRenderer
          key={session.current.id}
          exercise={session.current}
          onSubmit={(isCorrect, answer) =>
            session.submit({isCorrect, userAnswer: answer, timeSpentMs: 0})
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  topRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
});
