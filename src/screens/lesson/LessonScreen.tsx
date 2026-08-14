import {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
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
import {useCompleteLesson, useCompleteTask, useLessonSession} from '@/hooks';
import {useTheme} from '@/providers';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Lesson'>;
type Route = RouteProp<RootStackParamList, 'Lesson'>;

export const LessonScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();

  const exercisesQuery = useQuery({
    queryKey: ['exercises', params.lessonId],
    queryFn: () => lessonsApi.exercises(params.lessonId),
  });

  const session = useLessonSession(exercisesQuery.data ?? []);

  const lessonQuery = useQuery({
    queryKey: ['lesson', params.lessonId],
    queryFn: () => lessonsApi.get(params.lessonId),
  });

  const completeLesson = useCompleteLesson();
  const completeTask = useCompleteTask();

  useEffect(() => {
    // Running out of hearts ends the session too, otherwise the hearts counter is
    // decoration and a learner can miss every question and still finish.
    if (!session.isFinished && !session.isFailed) {
      return;
    }

    const finish = async () => {
      // Server-authoritative XP, not session.xp (correct-answers * a client
      // constant): that number had nothing to do with lessons.xp_reward and
      // stayed nonzero even on a repeat, which complete_lesson pays 0 XP for.
      let xpAwarded = 0;
      let isFirstCompletion = true;

      if (session.isFinished && !session.isFailed && lessonQuery.data) {
        try {
          const result = await completeLesson.mutateAsync({
            lessonId: params.lessonId,
            kind: lessonQuery.data.kind,
            score: Math.round(session.accuracy * 100),
            minutes: lessonQuery.data.estimated_minutes,
          });
          xpAwarded = result.xp_awarded;
          isFirstCompletion = result.is_first_completion;
          // Opened from the Tasks tab: close the task too, or its progress bar
          // never advances even though the lesson genuinely completed.
          if (params.taskId) {
            completeTask.mutate(params.taskId);
          }
        } catch (error) {
          // Better to show 0 XP than to claim an amount that may not have saved.
          console.warn('[Synapse] failed to record lesson completion', error);
        }
      }

      navigation.replace('LessonResult', {
        lessonId: params.lessonId,
        xp: xpAwarded,
        accuracy: session.accuracy,
        failed: session.isFailed,
        isFirstCompletion,
      });
    };

    finish();
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
          {/* Pips, not emoji hearts: neural primitives, no game-show dressing. */}
          <View style={styles.pips}>
            {Array.from({length: HEARTS_PER_SESSION}, (_, index) => (
              <View
                key={index}
                style={[
                  styles.pip,
                  {
                    borderRadius: theme.radius.pill,
                    backgroundColor:
                      index < session.hearts ? theme.colors.danger : theme.colors.surfaceAlt,
                  },
                ]}
              />
            ))}
          </View>
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
  pips: {flexDirection: 'row', gap: 5},
  pip: {width: 9, height: 9},
});
