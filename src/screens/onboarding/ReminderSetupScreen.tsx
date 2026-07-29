import {Pressable, Switch, View} from 'react-native';
import {Button, Card, Screen, Text} from '@/components';
import {formatHour, useDailyReminder, useUpdateProfile} from '@/hooks';
import {useTheme} from '@/providers';

const HOUR_OPTIONS = [8, 12, 18, 20, 21];

export const ReminderSetupScreen = () => {
  const theme = useTheme();
  const reminder = useDailyReminder();
  const updateProfile = useUpdateProfile();

  const finish = () => updateProfile.mutate({onboarding_completed: true});

  return (
    <Screen>
      <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.lg}}>
        <Text variant="h1">Stay on track</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          A daily reminder keeps your streak alive. Turn it on and pick a time — you can
          change it later in Settings.
        </Text>

        <Card style={{gap: theme.spacing.md}}>
          <View
            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text variant="bodyStrong">Daily reminder</Text>
            <Switch
              value={reminder.enabled}
              onValueChange={reminder.setEnabled}
              disabled={reminder.isSaving}
              trackColor={{true: theme.colors.primary, false: theme.colors.surfaceAlt}}
            />
          </View>

          {reminder.enabled && (
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm}}>
              {HOUR_OPTIONS.map(h => {
                const active = reminder.hour === h;
                return (
                  <Pressable
                    key={h}
                    onPress={() => reminder.setHour(h)}
                    disabled={reminder.isSaving}
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.radius.md,
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                    }}>
                    <Text
                      variant="bodyStrong"
                      color={active ? theme.colors.primary : theme.colors.text}>
                      {formatHour(h)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {!reminder.isAvailable && reminder.enabled && (
            <Text variant="caption" color={theme.colors.textTertiary}>
              Saved — reminders will start once notifications ship in a future update.
            </Text>
          )}
        </Card>
      </View>

      <View style={{gap: theme.spacing.md, paddingBottom: theme.spacing.lg}}>
        <Button label="Start learning" loading={updateProfile.isPending} onPress={finish} />
      </View>
    </Screen>
  );
};
