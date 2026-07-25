import {View} from 'react-native';
import {Button, Screen, Text} from '@/components';
import {useUpdateProfile} from '@/hooks';
import {useTheme} from '@/providers';

export const ReminderSetupScreen = () => {
  const theme = useTheme();
  const updateProfile = useUpdateProfile();

  const finish = async () => {
    await updateProfile.mutateAsync({onboarding_completed: true});
  };

  return (
    <Screen>
      <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.md}}>
        <Text variant="h1">Stay on track</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Daily reminders keep your streak alive. You can turn them on later in Settings.
        </Text>
      </View>
      <View style={{gap: theme.spacing.md, paddingBottom: theme.spacing.lg}}>
        <Button label="Start learning" loading={updateProfile.isPending} onPress={finish} />
      </View>
    </Screen>
  );
};
