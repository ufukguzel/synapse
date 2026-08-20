import {Pressable, SectionList, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Card, EmptyState, ErrorView, LoadingView, ProgressBar, Screen, Text} from '@/components';
import {coursesApi} from '@/api';
import {useLessonStates, useRegions, useUnits} from '@/hooks';
import {useTheme} from '@/providers';
import {REGION_FOR_LESSON_KIND} from '@/utils';
import type {Lesson, ProgressStatus} from '@/types';
import type {RootStackParamList} from '@/navigation/types';
import {useQueries} from '@tanstack/react-query';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
type Route = RouteProp<RootStackParamList, 'CourseDetail'>;

const STATUS_GLYPH: Record<ProgressStatus, string> = {
  completed: '✓',
  available: '›',
  in_progress: '›',
  locked: '🔒',
};

export const CourseDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();

  const units = useUnits(params.courseId);
  const unitList = units.data ?? [];
  const regions = useRegions();
  const states = useLessonStates(params.courseId);

  const lessonQueries = useQueries({
    queries: unitList.map(unit => ({
      queryKey: ['lessons', unit.id],
      queryFn: () => coursesApi.lessons(unit.id),
      enabled: !!unit.id,
    })),
  });

  if (units.isLoading || states.isLoading) {
    return <LoadingView />;
  }
  if (units.isError) {
    return <ErrorView error={units.error} onRetry={units.refetch} />;
  }

  const statusByLessonId = new Map((states.data ?? []).map(row => [row.lesson_id, row.status]));
  const accentFor = (lesson: Lesson) =>
    regions.data?.find(region => region.code === REGION_FOR_LESSON_KIND[lesson.kind])?.accent ??
    theme.colors.primary;

  const totalLessons = (states.data ?? []).length;
  const completedLessons = (states.data ?? []).filter(row => row.status === 'completed').length;

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
        ListHeaderComponent={
          totalLessons > 0 ? (
            <Card style={{gap: theme.spacing.sm, marginBottom: theme.spacing.base}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text variant="bodyStrong">Course progress</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  {completedLessons} / {totalLessons}
                </Text>
              </View>
              <ProgressBar
                value={totalLessons ? completedLessons / totalLessons : 0}
                gradient={completedLessons === totalLessons ? 'teal' : 'brand'}
              />
            </Card>
          ) : null
        }
        ListEmptyComponent={<EmptyState title="No units yet" />}
        renderSectionHeader={({section}) => (
          <Text variant="h3" style={{marginTop: theme.spacing.base, marginBottom: theme.spacing.sm}}>
            {section.title}
          </Text>
        )}
        renderItem={({item}) => {
          const status = statusByLessonId.get(item.id) ?? 'locked';
          const locked = status === 'locked';
          const completed = status === 'completed';
          const accent = accentFor(item);

          return (
            <Pressable
              disabled={locked}
              onPress={() => navigation.navigate('Lesson', {lessonId: item.id, title: item.title})}
              style={({pressed}) => ({opacity: locked ? 1 : pressed ? 0.85 : 1})}>
              <Card
                style={{
                  marginBottom: theme.spacing.sm,
                  opacity: locked ? 0.55 : 1,
                  borderColor: status === 'in_progress' ? theme.colors.primary : theme.colors.border,
                  borderWidth: status === 'in_progress' ? 1.5 : 1,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md}}>
                  {/* Region colour ties this lesson back to the brain map. */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: theme.radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: completed ? accent : theme.colors.surfaceAlt,
                    }}>
                    <Text
                      variant="body"
                      color={completed ? theme.colors.onPrimary : theme.colors.textTertiary}>
                      {STATUS_GLYPH[status]}
                    </Text>
                  </View>
                  <View style={{flex: 1, gap: theme.spacing.xxs}}>
                    <Text variant="bodyStrong" color={locked ? theme.colors.textTertiary : theme.colors.text}>
                      {item.title}
                    </Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {locked
                        ? 'Complete the previous lesson to unlock'
                        : `${item.kind} · ${item.estimated_minutes} min · +${item.xp_reward} XP`}
                    </Text>
                  </View>
                  {status === 'in_progress' && <Badge label="Continue" tone="primary" solid />}
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
};
