import {Dimensions, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Badge,
  BrainMap,
  Card,
  ErrorView,
  GradientSurface,
  LoadingView,
  NeuralPattern,
  ProgressBar,
  StatChip,
  Text,
} from '@/components';
import {
  useCourseOutline,
  useCourses,
  useDueVocabulary,
  useRecentActivity,
  useRegions,
  useStreak,
} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {formatMinutes, formatXp, pluralize} from '@/utils';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HERO_HEIGHT = 190;

const todayKey = () => new Date().toISOString().slice(0, 10);

/** Time-of-day greeting, matching the handoff's "Good evening, Eda". */
const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  return hour < 18 ? 'Good afternoon' : 'Good evening';
};

export const HomeScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {profile} = useAuth();

  const courses = useCourses(profile?.current_level);
  const streak = useStreak();
  const activity = useRecentActivity(7);
  const due = useDueVocabulary();
  const regions = useRegions();

  const courseList = courses.data ?? [];
  const currentCourse = courseList[0];
  const outline = useCourseOutline(currentCourse?.id);

  const dailyGoal = profile?.daily_goal_minutes ?? 10;
  const minutesToday =
    activity.data?.find(row => row.activity_date === todayKey())?.minutes_studied ?? 0;
  const goalProgress = dailyGoal > 0 ? minutesToday / dailyGoal : 0;
  const goalReached = minutesToday >= dailyGoal;

  const firstName = profile?.display_name?.split(' ')[0];
  const dueCount = due.data?.length ?? 0;

  const regionList = regions.data ?? [];
  // The weakest region is what the plan should attack next.
  const weakest = regionList.reduce<(typeof regionList)[number] | undefined>(
    (lowest, region) => (!lowest || region.strength < lowest.strength ? region : lowest),
    undefined,
  );
  const strongest = regionList.reduce<(typeof regionList)[number] | undefined>(
    (highest, region) => (!highest || region.strength > highest.strength ? region : highest),
    undefined,
  );

  const firstOpenIndex = outline.lessons.findIndex(lesson => !lesson.isCompleted);
  const nextLesson = firstOpenIndex >= 0 ? outline.lessons[firstOpenIndex] : undefined;

  const hero = (
    <GradientSurface
      gradient="hero"
      style={[
        styles.hero,
        {
          paddingTop: insets.top + theme.spacing.sm,
          paddingHorizontal: theme.spacing.base,
          paddingBottom: theme.spacing.lg,
          gap: theme.spacing.base,
        },
      ]}>
      <View style={styles.pattern} pointerEvents="none">
        <NeuralPattern
          width={Dimensions.get('window').width}
          height={HERO_HEIGHT}
          color={theme.brand.mist}
          opacity={0.12}
        />
      </View>

      <Text variant="h1" color={theme.brand.mist}>
        {firstName ? `${greeting()}, ${firstName}` : greeting()}
      </Text>

      <View style={[styles.chips, {gap: theme.spacing.sm}]}>
        <StatChip value={`${streak.data?.current_streak ?? 0}-day`} label="streak" onGradient />
        <StatChip
          value={formatXp(streak.data?.total_xp ?? 0)}
          label="neural strength"
          onGradient
        />
      </View>
    </GradientSurface>
  );

  if (courses.isError) {
    return (
      <View style={[styles.flex, {backgroundColor: theme.colors.backgroundAlt}]}>
        {hero}
        <ErrorView error={courses.error} onRetry={courses.refetch} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, {backgroundColor: theme.colors.backgroundAlt}]}>
      {hero}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: theme.spacing.base,
          paddingBottom: theme.spacing.xxl,
          gap: theme.spacing.lg,
        }}>
        {/* 1 - the signature brain map */}
        <Card style={{gap: theme.spacing.base, alignItems: 'center'}}>
          <View style={[styles.row, styles.fullWidth]}>
            <Text variant="bodyStrong">Your brain today</Text>
            <Text variant="caption" color={theme.colors.textTertiary}>
              {regionList.length ? 'Tap a region' : ''}
            </Text>
          </View>

          {regions.isLoading ? (
            <View style={{height: 240, justifyContent: 'center'}}>
              <LoadingView />
            </View>
          ) : (
            <BrainMap
              regions={regionList}
              focusCode={weakest?.code}
              size={Math.min(Dimensions.get('window').width - 64, 330)}
            />
          )}

          {!!strongest && !!weakest && (
            <View style={[styles.row, styles.fullWidth]}>
              <View style={{gap: theme.spacing.xxs}}>
                <Text variant="overline" color={theme.colors.textTertiary}>
                  Strongest
                </Text>
                <Text variant="bodyStrong">{strongest.title}</Text>
              </View>
              <View style={{gap: theme.spacing.xxs, alignItems: 'flex-end'}}>
                <Text variant="overline" color={theme.colors.textTertiary}>
                  Focus next
                </Text>
                <Text variant="bodyStrong" color={theme.colors.accent}>
                  {weakest.title}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* 2 - today's goal */}
        <Card style={{gap: theme.spacing.md}}>
          <View style={styles.row}>
            <Text variant="bodyStrong">Today's goal</Text>
            <Text
              variant="caption"
              color={goalReached ? theme.colors.success : theme.colors.textSecondary}>
              {goalReached
                ? "Today's goal met"
                : `${formatMinutes(minutesToday)} / ${formatMinutes(dailyGoal)}`}
            </Text>
          </View>
          <ProgressBar value={goalProgress} gradient={goalReached ? 'teal' : 'brand'} />
        </Card>

        {/* 3 - resume the next lesson */}
        {!!nextLesson && (
          <Pressable
            onPress={() =>
              navigation.navigate('Lesson', {lessonId: nextLesson.id, title: nextLesson.title})
            }
            style={({pressed}) => ({opacity: pressed ? 0.9 : 1})}>
            <Card gradient="brand" style={{gap: theme.spacing.sm}}>
              <Text variant="overline" color="rgba(236, 234, 254, 0.8)">
                Continue learning
              </Text>
              <Text variant="h3" color={theme.brand.mist}>
                {nextLesson.title}
              </Text>
              <Text variant="caption" color="rgba(236, 234, 254, 0.85)">
                {nextLesson.unitTitle} · {nextLesson.estimated_minutes} min · +
                {nextLesson.xp_reward} XP
              </Text>
            </Card>
          </Pressable>
        )}

        {/* 4 - words about to fade */}
        {dueCount > 0 && (
          <Pressable
            onPress={() => navigation.navigate('VocabularyReview')}
            style={({pressed}) => ({opacity: pressed ? 0.9 : 1})}>
            <Card style={{gap: theme.spacing.sm}}>
              <View style={styles.row}>
                <Text variant="bodyStrong">Memory check</Text>
                <Badge label={`${dueCount} due`} tone="warning" solid />
              </View>
              <Text variant="body" color={theme.colors.textSecondary}>
                {pluralize(dueCount, 'word')} about to fade. A quick pass keeps them.
              </Text>
            </Card>
          </Pressable>
        )}

        {/* 5 - other courses */}
        {courseList.length > 1 && (
          <View style={{gap: theme.spacing.md}}>
            <Text variant="h2">More courses</Text>
            {courseList.slice(1).map(course => (
              <Pressable
                key={course.id}
                onPress={() =>
                  navigation.navigate('CourseDetail', {courseId: course.id, title: course.title})
                }
                style={({pressed}) => ({opacity: pressed ? 0.9 : 1})}>
                <Card style={{gap: theme.spacing.sm}}>
                  <View style={styles.row}>
                    <Badge label={course.level} tone="primary" />
                    <Text variant="caption" color={theme.colors.textTertiary}>
                      Start →
                    </Text>
                  </View>
                  <Text variant="h3">{course.title}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  fullWidth: {alignSelf: 'stretch'},
  // flexShrink:0 is load-bearing: as a flex child next to the scroll view the
  // gradient collapsed below its content height, clipping the greeting and chips.
  hero: {flexShrink: 0, borderBottomLeftRadius: 28, borderBottomRightRadius: 28},
  pattern: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  chips: {flexDirection: 'row', flexWrap: 'wrap'},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
});
