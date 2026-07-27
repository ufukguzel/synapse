import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Button, Card, Screen, Text} from '@/components';
import {useRecentActivity, useStreak} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {formatMinutes, formatXp} from '@/utils';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Last 7 dates, oldest first, as YYYY-MM-DD. */
const lastSevenDays = () => {
  const today = new Date();
  return Array.from({length: 7}, (_, offset) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - offset));
    return {key: day.toISOString().slice(0, 10), weekday: day.getDay()};
  });
};

export const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {profile, user} = useAuth();
  const streak = useStreak();
  const activity = useRecentActivity(7);

  const days = activity.data ?? [];
  const weekMinutes = days.reduce((sum, day) => sum + day.minutes_studied, 0);
  const minutesByDate = new Map(days.map(day => [day.activity_date, day.minutes_studied]));

  const initial = (profile?.display_name ?? user?.email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <View style={[styles.identity, {gap: theme.spacing.base}]}>
          <View
            style={[
              styles.avatar,
              {backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.pill},
            ]}>
            <Text variant="h1" color={theme.colors.primary}>
              {initial}
            </Text>
          </View>
          <View style={{flex: 1, gap: theme.spacing.xs}}>
            <Text variant="h2">{profile?.display_name ?? user?.email ?? 'Profile'}</Text>
            {!!profile?.current_level && (
              <Badge label={`Level ${profile.current_level}`} tone="primary" solid />
            )}
          </View>
        </View>

        {/* Two headline numbers, then the detail rows - a flat list of six rows
            gave the streak no more weight than the timezone. */}
        <View style={{flexDirection: 'row', gap: theme.spacing.md}}>
          <Card gradient="accent" style={[styles.metric, {gap: theme.spacing.xxs}]}>
            <Text variant="display" color={theme.palette.white}>
              {streak.data?.current_streak ?? 0}
            </Text>
            <Text variant="caption" color="rgba(255, 255, 255, 0.85)">
              day streak
            </Text>
          </Card>
          <Card style={[styles.metric, {gap: theme.spacing.xxs}]}>
            <Text variant="display">{formatXp(streak.data?.total_xp ?? 0)}</Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              neural strength
            </Text>
          </Card>
        </View>

        <Card style={{gap: theme.spacing.base}}>
          <View style={styles.row}>
            <Text variant="bodyStrong">This week</Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {formatMinutes(weekMinutes)}
            </Text>
          </View>
          <View style={styles.week}>
            {lastSevenDays().map(day => {
              const studied = (minutesByDate.get(day.key) ?? 0) > 0;
              return (
                <View key={day.key} style={[styles.day, {gap: theme.spacing.xs}]}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: theme.radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: studied ? theme.colors.success : theme.colors.surfaceAlt,
                    }}>
                    <Text variant="caption" color={studied ? theme.palette.white : theme.colors.textTertiary}>
                      {studied ? '✓' : '·'}
                    </Text>
                  </View>
                  <Text variant="caption" color={theme.colors.textTertiary}>
                    {DAY_LABELS[day.weekday]}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={{gap: theme.spacing.md}}>
          <Row label="Longest streak" value={`${streak.data?.longest_streak ?? 0} days`} />
          <Row label="Daily goal" value={formatMinutes(profile?.daily_goal_minutes ?? 10)} />
          <Row label="Target level" value={profile?.target_level ?? '—'} />
        </Card>

        <Button
          label="Settings"
          variant="secondary"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </Screen>
  );
};

const Row = ({label, value}: {label: string; value: string}) => {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="body" color={theme.colors.textSecondary}>
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  identity: {flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 64, height: 64, alignItems: 'center', justifyContent: 'center'},
  metric: {flex: 1, alignItems: 'center'},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  week: {flexDirection: 'row', justifyContent: 'space-between'},
  day: {alignItems: 'center'},
});
