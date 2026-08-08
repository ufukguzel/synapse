import {Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  Badge,
  Card,
  EmptyState,
  ErrorView,
  LoadingView,
  ProgressBar,
  Screen,
  Text,
} from '@/components';
import {useCompleteTask, useDailyPlan, useRegions} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {formatMinutes} from '@/utils';
import type {DailyTask, RegionCode} from '@/types';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const TasksScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {profile} = useAuth();
  const plan = useDailyPlan();
  const regions = useRegions();
  const completeTask = useCompleteTask();

  const accentFor = (code: RegionCode) =>
    regions.data?.find(region => region.code === code)?.accent ?? theme.colors.primary;

  const titleFor = (code: RegionCode) =>
    regions.data?.find(region => region.code === code)?.title ?? code;

  const openTask = (task: DailyTask) => {
    if (task.status === 'completed') {
      return;
    }
    if (task.lesson_id) {
      navigation.navigate('Lesson', {lessonId: task.lesson_id, title: task.title});
      return;
    }
    // A task with no lesson is the vocabulary review.
    navigation.navigate('VocabularyReview');
  };

  if (plan.error) {
    return <ErrorView error={plan.error} />;
  }

  if (plan.isLoading && plan.totalCount === 0) {
    return <LoadingView message="Building today's plan…" />;
  }

  const goal = profile?.daily_goal_minutes ?? 10;
  const progress = plan.totalCount ? plan.completedCount / plan.totalCount : 0;
  const allDone = plan.totalCount > 0 && plan.completedCount === plan.totalCount;

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <View style={{gap: theme.spacing.sm}}>
          <Text variant="display">Today</Text>
          <Text variant="bodyLg" color={theme.colors.textSecondary}>
            {allDone
              ? 'Every pathway on the list is stronger than it was this morning.'
              : `Balanced across regions · about ${formatMinutes(
                  plan.remainingMinutes || goal,
                )} left`}
          </Text>
        </View>

        {plan.totalCount > 0 && (
          <Card style={{gap: theme.spacing.md}}>
            <View style={styles.row}>
              <Text variant="bodyStrong">
                {plan.completedCount} / {plan.totalCount} done
              </Text>
              <Text variant="caption" color={theme.colors.textSecondary}>
                {formatMinutes(goal)} goal
              </Text>
            </View>
            <ProgressBar value={progress} gradient={allDone ? 'teal' : 'brand'} />
          </Card>
        )}

        {plan.totalCount === 0 ? (
          <EmptyState
            title="Nothing to train yet"
            description="There are no lessons left at your level and no words are due. New content will show up here."
          />
        ) : (
          <View style={{gap: theme.spacing.md}}>
            {plan.tasks.map(task => {
              const done = task.status === 'completed';
              const accent = accentFor(task.region_code);

              return (
                <Pressable
                  key={task.id}
                  onPress={() => openTask(task)}
                  disabled={done}
                  style={({pressed}) => ({opacity: pressed ? 0.9 : 1})}>
                  <Card style={{gap: theme.spacing.sm}}>
                    <View style={styles.row}>
                      <View style={[styles.regionRow, {gap: theme.spacing.sm}]}>
                        {/* A node in the region's colour ties the task to the brain map. */}
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: theme.radius.pill,
                            backgroundColor: accent,
                            opacity: done ? 0.4 : 1,
                          }}
                        />
                        <Text variant="overline" color={theme.colors.textTertiary}>
                          {titleFor(task.region_code)}
                        </Text>
                      </View>
                      {done ? (
                        <Badge label="Done" tone="success" />
                      ) : (
                        <Text variant="caption" color={theme.colors.textTertiary}>
                          ~{formatMinutes(task.estimated_minutes)}
                        </Text>
                      )}
                    </View>

                    <Text
                      variant="h3"
                      color={done ? theme.colors.textTertiary : theme.colors.text}>
                      {task.title}
                    </Text>

                    {!done && (
                      <Text variant="caption" color={theme.colors.textSecondary}>
                        Strengthens {titleFor(task.region_code)}
                      </Text>
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Manual completion for the tasks a lesson cannot close on its own. */}
        {plan.tasks.some(task => task.status === 'pending' && !task.lesson_id) && (
          <Text variant="caption" color={theme.colors.textTertiary}>
            Review tasks close themselves once every due word has been seen.
          </Text>
        )}

        {completeTask.isError && (
          <Text variant="caption" color={theme.colors.danger}>
            Could not update the task. Please try again.
          </Text>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  regionRow: {flexDirection: 'row', alignItems: 'center'},
});
