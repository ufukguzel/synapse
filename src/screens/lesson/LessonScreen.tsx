import {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {
  Button,
  EmptyState,
  ErrorView,
  ExerciseRenderer,
  LoadingView,
  ProgressBar,
  Screen,
  Text,
} from '@/components';
import {lessonsApi} from '@/api';
import {useCompleteLesson, useLessonSession} from '@/hooks';
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

  const completeLesson = useCompleteLesson();

  // The finish effect completes the lesson server-side, so it must run exactly
  // once even if the effect is re-invoked (StrictMode, remounts).
  const finalizedRef = useRef(false);

  useEffect(() => {
    // Running out of hearts ends the lesson without completing it, so it must
    // not trigger the completion RPC — even if the last wrong answer also
    // pushed the index past the end (isFinished && isFailed at once).
    if (session.isFailed || !session.isFinished || finalizedRef.current) {
      return;
    }
    finalizedRef.current = true;

    const goToResult = (xp: number) =>
      navigation.replace('LessonResult', {
        lessonId: params.lessonId,
        xp,
        accuracy: session.accuracy,
      });

    if (!user?.id) {
      // No session (offline / placeholder creds): skip the server round-trip
      // and show the locally-tallied XP.
      goToResult(session.xp);
      return;
    }

    // Wait for the RPC so the result screen shows the XP the server actually
    // awarded (a lesson's fixed reward, zero on a repeat), not a local guess.
    completeLesson.mutate(
      {
        lessonId: params.lessonId,
        score: Math.round(session.accuracy * 100),
        minutes: session.minutesStudied,
      },
      {
        onSuccess: result => goToResult(result.xp_awarded),
        onError: () => goToResult(session.xp),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isFinished]);

  // Finished, waiting on the completion RPC before the result screen.
  if (session.isFinished && completeLesson.isPending) {
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

  // Out of hearts: the lesson ends here. Nothing is recorded — the learner
  // retries the whole lesson or leaves.
  if (session.isFailed) {
    return (
      <Screen>
        <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.lg}}>
          <Text variant="display" center>
            💔
          </Text>
          <Text variant="h1" center>
            Out of hearts
          </Text>
          <Text variant="body" center color={theme.colors.textSecondary}>
            You ran out of hearts. Give the lesson another go — you've got this.
          </Text>
          <View style={{gap: theme.spacing.sm}}>
            <Button label="Try again" onPress={session.reset} />
            <Button
              label="Back to lessons"
              variant="ghost"
              onPress={() => navigation.navigate('Main', {screen: 'HomeTab'})}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{gap: theme.spacing.sm, marginBottom: theme.spacing.lg}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            {Math.min(session.index + 1, session.exercises.length)} / {session.exercises.length}
          </Text>
          <Text variant="caption" color={theme.colors.danger}>
            {'♥'.repeat(session.hearts)}
          </Text>
        </View>
        <ProgressBar value={session.progress} />
      </View>

      {session.current && (
        <ExerciseRenderer
          key={session.current.id}
          exercise={session.current}
          onSubmit={(isCorrect, answer) => session.submit({isCorrect, userAnswer: answer})}
        />
      )}
    </Screen>
  );
};
