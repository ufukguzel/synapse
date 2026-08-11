import {SectionList, Pressable, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQueries} from '@tanstack/react-query';
import {Badge, Card, EmptyState, ErrorView, LoadingView, Screen, Text} from '@/components';
import {coursesApi} from '@/api';
import {useLessonStates, useUnits} from '@/hooks';
import {useTheme} from '@/providers';
import type {Lesson, ProgressStatus} from '@/types';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
type Route = RouteProp<RootStackParamList, 'CourseDetail'>;

export const CourseDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();

  const units = useUnits(params.courseId);
  const unitList = units.data ?? [];
  const states = useLessonStates(params.courseId);

  const lessonQueries = useQueries({
    queries: unitList.map(unit => ({
      queryKey: ['lessons', unit.id],
      queryFn: () => coursesApi.lessons(unit.id),
      enabled: !!unit.id,
    })),
  });

  if (units.isLoading) {
    return <LoadingView />;
  }
  if (units.isError) {
    return <ErrorView error={units.error} onRetry={units.refetch} />;
  }

  // Absent state (RPC still loading / offline) keeps a lesson tappable, so a
  // network hiccup never traps the learner behind a lock.
  const stateFor = (lessonId: string) => states.data?.find(s => s.lesson_id === lessonId);

  const sections = unitList.map((unit, index) => ({
    title: unit.title,
    data: (lessonQueries[index]?.data ?? []) as Lesson[],
  }));

  return (
    <Screen padded={false}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: theme.spacing.base, gap: theme.spacing.sm}}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<EmptyState title="No units yet" />}
        renderSectionHeader={({section}) => (
          <Text variant="h3" style={{marginTop: theme.spacing.base, marginBottom: theme.spacing.sm}}>
            {section.title}
          </Text>
        )}
        renderItem={({item}) => {
          const status: ProgressStatus = stateFor(item.id)?.status ?? 'available';
          const score = stateFor(item.id)?.score ?? null;
          const locked = status === 'locked';

          return (
            <Pressable
              disabled={locked}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}${locked ? ', locked' : ''}`}
              accessibilityState={{disabled: locked}}
              onPress={() =>
                navigation.navigate('Lesson', {lessonId: item.id, title: item.title})
              }>
              <Card style={{marginBottom: theme.spacing.sm, opacity: locked ? 0.55 : 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{flex: 1, gap: theme.spacing.xxs}}>
                    <Text variant="bodyStrong">{item.title}</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {item.kind} · {item.estimated_minutes} min · +{item.xp_reward} XP
                    </Text>
                  </View>
                  <LessonTrailing status={status} score={score} lockColor={theme.colors.textTertiary} />
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
};

const LessonTrailing = ({
  status,
  score,
  lockColor,
}: {
  status: ProgressStatus;
  score: number | null;
  lockColor: string;
}) => {
  if (status === 'completed') {
    return <Badge label={score !== null ? `✓ ${score}%` : '✓'} tone="success" />;
  }
  if (status === 'locked') {
    return (
      <Text variant="h3" color={lockColor}>
        🔒
      </Text>
    );
  }
  if (status === 'in_progress') {
    return <Badge label="Resume" tone="primary" />;
  }
  return (
    <Text variant="h3" color={lockColor}>
      ›
    </Text>
  );
};
