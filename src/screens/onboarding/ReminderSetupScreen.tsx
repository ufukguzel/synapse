import {View} from 'react-native';
import {Button, Screen, Text} from '@/components';
import {useUpdateProfile} from '@/hooks';
import {useT, useTheme} from '@/providers';

export const ReminderSetupScreen = () => {
  const theme = useTheme();
  const {t} = useT();
  const updateProfile = useUpdateProfile();

  const finish = async () => {
    await updateProfile.mutateAsync({onboarding_completed: true});
  };

  return (
    <Screen>
      <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.md}}>
        <Text variant="h1">{t('onb.reminder.title')}</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          {t('onb.reminder.subtitle')}
        </Text>
      </View>
      <View style={{gap: theme.spacing.md, paddingBottom: theme.spacing.lg}}>
        <Button label={t('onb.reminder.start')} loading={updateProfile.isPending} onPress={finish} />
      </View>
    </Screen>
  );
};
