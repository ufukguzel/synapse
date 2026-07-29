import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Badge, Button, Card, Screen, Text} from '@/components';
import {useUserStats} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {formatMinutes, formatXp} from '@/utils';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {profile, user} = useAuth();
  const stats = useUserStats();
  const s = stats.data;

  return (
    <Screen scroll>
      <View style={{gap: theme.spacing.base}}>
        <Text variant="h1">{profile?.display_name ?? user?.email ?? 'Profile'}</Text>
        {!!profile?.current_level && <Badge label={profile.current_level} tone="primary" />}

        <Card style={{gap: theme.spacing.md}}>
          <Row label="Current streak" value={`${s?.current_streak ?? 0} days`} />
          <Row label="Longest streak" value={`${s?.longest_streak ?? 0} days`} />
          <Row label="Total XP" value={formatXp(s?.total_xp ?? 0)} />
          <Row label="This week" value={formatMinutes(s?.minutes_week ?? 0)} />
          <Row label="Lessons completed" value={`${s?.lessons_completed ?? 0}`} />
          <Row
            label="Words learned"
            value={
              s && s.words_due > 0
                ? `${s.words_learned} · ${s.words_due} due`
                : `${s?.words_learned ?? 0}`
            }
          />
          <Row label="Favorites" value={`★ ${s?.words_favorite ?? 0}`} />
        </Card>

        {!!s && s.words_favorite > 0 && (
          <Button
            label="View favorites"
            variant="secondary"
            onPress={() => navigation.navigate('Favorites')}
          />
        )}

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
