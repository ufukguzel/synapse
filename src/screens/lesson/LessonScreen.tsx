import {useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
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
import {useLessonSession} from '@/hooks';
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

  const queryClient = useQueryClient();

  // One atomic call: progress + server-side XP + streak + vocabulary enrolment.
  // Replaces the old two-step (upsert + record_activity) so XP can't be inflated
  // by the client and the lesson's words land in the review queue automatically.
  const completeLesson = useMutation({
    mutationFn: (vars: {score: number; minutes: number}) =>
      lessonsApi.completeLesson({
        lessonId: params.lessonId,
        score: vars.score,
        minutes: vars.minutes,
      }),
    onSuccess: () => {
      if (!user?.id) {
        return;
      }
      queryClient.invalidateQueries({queryKey: ['streak', user.id]});
      queryClient.invalidateQueries({queryKey: ['daily-activity', user.id]});
      queryClient.invalidateQueries({queryKey: ['profile', user.id]});
      // Completing a lesson can unlock the next one.
      queryClient.invalidateQueries({queryKey: ['lesson-states']});
    },
  });

  // Finish/fail fires the effect; guard so completion runs exactly once.
  const finalizedRef = useRef(false);

  useEffect(() => {
    if ((!session.isFinished && !session.isFailed) || finalizedRef.current) {
      return;
    }
    finalizedRef.current = true;

    const goToResult = (xp: number) =>
      navigation.replace('LessonResult', {
        lessonId: params.lessonId,
        xp,
        accuracy: session.accuracy,
        failed: session.isFailed,
      });

    // A failed run (out of hearts) is not a completion — record nothing.
    if (session.isFailed || !user?.id) {
      goToResult(session.xp);
      return;
    }

    // Wait for the RPC so the result shows the XP the server actually awarded.
    completeLesson.mutate(
      {score: Math.round(session.accuracy * 100), minutes: lessonQuery.data?.estimated_minutes ?? 0},
      {
        onSuccess: result => goToResult(result.xp_awarded),
        onError: () => goToResult(session.xp),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isFinished, session.isFailed]);

  // Finished (not failed), waiting on the completion RPC before the result screen.
  if (session.isFinished && !session.isFailed && completeLesson.isPending) {
    return <LoadingView message="Saving your progress…" />;
  }

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
