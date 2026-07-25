import {Alert, View} from 'react-native';
import {Button, Card, Screen, Text} from '@/components';
import {APP_NAME} from '@/constants';
import {useAuth, useTheme} from '@/providers';

export const SettingsScreen = () => {
  const theme = useTheme();
  const {signOut, user} = useAuth();

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
      <View style={{gap: theme.spacing.base}}>
        <Card style={{gap: theme.spacing.sm}}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Signed in as
          </Text>
          <Text variant="bodyStrong">{user?.email}</Text>
        </Card>

        <Button label="Sign out" variant="danger" onPress={confirmSignOut} />

        <Text variant="caption" center color={theme.colors.textTertiary}>
          {APP_NAME} v0.1.0
        </Text>
      </View>
    </Screen>
  );
};
