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
import {useDailyPlan, useRegions} from '@/hooks';
import {useAuth, useT, useTheme} from '@/providers';
import type {DailyTask, RegionCode} from '@/types';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const TasksScreen = () => {
  const theme = useTheme();
  const {t, formatMinutes} = useT();
  const navigation = useNavigation<Nav>();
  const {profile} = useAuth();
  const plan = useDailyPlan();
  const regions = useRegions();

  const accentFor = (code: RegionCode) =>
    regions.data?.find(region => region.code === code)?.accent ?? theme.colors.primary;

  const titleFor = (code: RegionCode) =>
    regions.data?.find(region => region.code === code)?.title ?? code;

  const openTask = (task: DailyTask) => {
    if (task.status === 'completed') {
      return;
    }
    if (task.lesson_id) {
      navigation.navigate('Lesson', {lessonId: task.lesson_id, title: task.title, taskId: task.id});
      return;
    }
    // A task with no lesson is the vocabulary review.
    navigation.navigate('VocabularyReview', {taskId: task.id});
  };

  if (plan.error) {
    return <ErrorView error={plan.error} />;
  }

  if (plan.isLoading && plan.totalCount === 0) {
    return <LoadingView message={t('tasks.building')} />;
  }

  const goal = profile?.daily_goal_minutes ?? 10;
  const progress = plan.totalCount ? plan.completedCount / plan.totalCount : 0;
  const allDone = plan.totalCount > 0 && plan.completedCount === plan.totalCount;

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <View style={{gap: theme.spacing.sm}}>
          <Text variant="display">{t('tasks.today')}</Text>
          <Text variant="bodyLg" color={theme.colors.textSecondary}>
            {allDone
              ? t('tasks.allDone')
              : t('tasks.balanced', {minutes: formatMinutes(plan.remainingMinutes || goal)})}
          </Text>
        </View>

        {plan.totalCount > 0 && (
          <Card style={{gap: theme.spacing.md}}>
            <View style={styles.row}>
              <Text variant="bodyStrong">
                {t('tasks.done', {completed: plan.completedCount, total: plan.totalCount})}
              </Text>
              <Text variant="caption" color={theme.colors.textSecondary}>
                {t('tasks.goalSuffix', {minutes: formatMinutes(goal)})}
              </Text>
            </View>
            <ProgressBar value={progress} gradient={allDone ? 'teal' : 'brand'} />
          </Card>
        )}

        {plan.totalCount === 0 ? (
          <EmptyState title={t('tasks.nothingTitle')} description={t('tasks.nothingDesc')} />
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
                        <Badge label={t('tasks.doneBadge')} tone="success" />
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
                        {t('tasks.strengthens', {region: titleFor(task.region_code)})}
                      </Text>
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  regionRow: {flexDirection: 'row', alignItems: 'center'},
});
