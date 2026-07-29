import {FlatList, Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Card, EmptyState, ErrorView, LoadingView, ProgressBar, Screen, Text} from '@/components';
import {useCourses, useUserStats} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {formatXp} from '@/utils';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {profile} = useAuth();
  const courses = useCourses(profile?.current_level);
  const stats = useUserStats();

  if (courses.isLoading) {
    return <LoadingView />;
  }
  if (courses.isError) {
    return <ErrorView error={courses.error} onRetry={courses.refetch} />;
  }

  const dailyGoal = stats.data?.daily_goal_minutes ?? profile?.daily_goal_minutes ?? 10;
  const minutesToday = stats.data?.minutes_today ?? 0;
  const goalMet = stats.data?.goal_met_today ?? false;
  const goalProgress = dailyGoal > 0 ? Math.min(1, minutesToday / dailyGoal) : 0;

  return (
    <Screen padded={false}>
      <FlatList
        data={courses.data ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: theme.spacing.base, gap: theme.spacing.md}}
        ListHeaderComponent={
          <View style={{gap: theme.spacing.md, marginBottom: theme.spacing.sm}}>
            <Text variant="h1">
              Hi{profile?.display_name ? `, ${profile.display_name}` : ''} 👋
            </Text>
            <Card style={{gap: theme.spacing.sm}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text variant="bodyStrong">Today's goal</Text>
                <Text
                  variant="caption"
                  color={goalMet ? theme.colors.success : theme.colors.textSecondary}>
                  {goalMet ? '✓ done' : `${minutesToday} / ${dailyGoal} min`}
                </Text>
              </View>
              <ProgressBar value={goalProgress} />
              <View style={{flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.xs}}>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  🔥 {stats.data?.current_streak ?? 0} day streak
                </Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  ⚡ {formatXp(stats.data?.total_xp ?? 0)} XP
                </Text>
              </View>
            </Card>
            <Text variant="h3">Courses</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No courses yet"
            description="Content is being prepared. Check back shortly."
          />
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() => navigation.navigate('CourseDetail', {courseId: item.id, title: item.title})}>
            <Card style={{gap: theme.spacing.sm}}>
              <Badge label={item.level} tone="primary" />
              <Text variant="h3">{item.title}</Text>
              {!!item.description && (
                <Text variant="caption" color={theme.colors.textSecondary}>
                  {item.description}
                </Text>
              )}
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
};
