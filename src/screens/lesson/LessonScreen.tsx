import {useEffect} from 'react';
import {View} from 'react-native';
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

  const completeLesson = useMutation({
    mutationFn: (score: number) =>
      lessonsApi.complete({userId: user!.id, lessonId: params.lessonId, score}),
  });

  useEffect(() => {
    if (!session.isFinished) {
      return;
    }
    const score = Math.round(session.accuracy * 100);
    if (user?.id) {
      completeLesson.mutate(score);
    }
    navigation.replace('LessonResult', {
      lessonId: params.lessonId,
      xp: session.xp,
      accuracy: session.accuracy,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isFinished]);

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
          onSubmit={(isCorrect, answer) =>
            session.submit({isCorrect, userAnswer: answer, timeSpentMs: 0})
          }
        />
      )}
    </Screen>
  );
};
