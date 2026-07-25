import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Button, Card, Screen, Text} from '@/components';
import {useRecentActivity, useStreak} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {formatMinutes, formatXp} from '@/utils';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {profile, user} = useAuth();
  const streak = useStreak();
  const activity = useRecentActivity(7);

  const weekMinutes = (activity.data ?? []).reduce((sum, day) => sum + day.minutes_studied, 0);

  return (
    <Screen scroll>
      <View style={{gap: theme.spacing.base}}>
        <Text variant="h1">{profile?.display_name ?? user?.email ?? 'Profile'}</Text>
        {!!profile?.current_level && <Badge label={profile.current_level} tone="primary" />}

        <Card style={{gap: theme.spacing.md}}>
          <Row label="Current streak" value={`${streak.data?.current_streak ?? 0} days`} />
          <Row label="Longest streak" value={`${streak.data?.longest_streak ?? 0} days`} />
          <Row label="Total XP" value={formatXp(streak.data?.total_xp ?? 0)} />
          <Row label="This week" value={formatMinutes(weekMinutes)} />
        </Card>

        <Button label="Settings" variant="secondary" onPress={() => navigation.navigate('Settings')} />
      </View>
    </Screen>
  );
};

const Row = ({label, value}: {label: string; value: string}) => {
  const theme = useTheme();
  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text variant="body" color={theme.colors.textSecondary}>
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
};
