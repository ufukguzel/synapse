import {useState} from 'react';
import {Alert, Pressable, View} from 'react-native';
import {Badge, Button, Card, Input, Screen, Text} from '@/components';
import {APP_NAME, CEFR_LABELS, CEFR_LEVELS, DAILY_GOAL_OPTIONS} from '@/constants';
import {useUpdateProfile} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {formatMinutes} from '@/utils';
import type {CefrLevel} from '@/types';

export const SettingsScreen = () => {
  const theme = useTheme();
  const {signOut, user, profile} = useAuth();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile?.display_name ?? '');
  const nameChanged = name.trim().length > 0 && name.trim() !== (profile?.display_name ?? '');

  const saveName = () => updateProfile.mutate({display_name: name.trim()});
  const setGoal = (daily_goal_minutes: number) => updateProfile.mutate({daily_goal_minutes});
  const setLevel = (current_level: CefrLevel) => updateProfile.mutate({current_level});

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Sign out failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign out', style: 'destructive', onPress: handleSignOut},
    ]);
  };

  return (
    <Screen scroll>
      <View style={{gap: theme.spacing.lg}}>
        <Card style={{gap: theme.spacing.sm}}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Signed in as
          </Text>
          <Text variant="bodyStrong">{user?.email}</Text>
        </Card>

        {/* Display name */}
        <View style={{gap: theme.spacing.sm}}>
          <Text variant="h3">Display name</Text>
          <Input value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
          <Button
            label="Save name"
            variant="secondary"
            disabled={!nameChanged}
            loading={updateProfile.isPending}
            onPress={saveName}
          />
        </View>

        {/* Daily goal */}
        <View style={{gap: theme.spacing.sm}}>
          <Text variant="h3">Daily goal</Text>
          {DAILY_GOAL_OPTIONS.map(option => {
            const active = profile?.daily_goal_minutes === option;
            return (
              <Pressable key={option} onPress={() => setGoal(option)} disabled={active}>
                <Card
                  style={{
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    borderWidth: active ? 2 : 1,
                  }}>
                  <Text variant="bodyStrong">{formatMinutes(option)} a day</Text>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {/* Level */}
        <View style={{gap: theme.spacing.sm}}>
          <Text variant="h3">Level</Text>
          {CEFR_LEVELS.map(level => {
            const active = profile?.current_level === level;
            return (
              <Pressable key={level} onPress={() => setLevel(level)} disabled={active}>
                <Card
                  style={{
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    borderWidth: active ? 2 : 1,
                    gap: theme.spacing.xs,
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm}}>
                    <Badge label={level} tone={active ? 'primary' : 'neutral'} />
                    <Text variant="bodyStrong">{CEFR_LABELS[level].title}</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>

        <Button label="Sign out" variant="danger" onPress={confirmSignOut} />

        <Text variant="caption" center color={theme.colors.textTertiary}>
          {APP_NAME} v0.1.0
        </Text>
      </View>
    </Screen>
  );
};
