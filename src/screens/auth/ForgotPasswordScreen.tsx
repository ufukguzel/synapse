import {useState} from 'react';
import {View} from 'react-native';
import {Button, Input, Screen, Text} from '@/components';
import {authService} from '@/services/supabase';
import {useTheme} from '@/providers';
import {isValidEmail} from '@/utils';

export const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    const {error: apiError} = await authService.resetPassword(email.trim());
    setLoading(false);
    if (apiError) {
      setError(apiError.message);
      return;
    }
    setSent(true);
  };

  return (
    <Screen scroll>
      <View style={{gap: theme.spacing.lg, flex: 1, justifyContent: 'center'}}>
        <Text variant="h1">Reset password</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          We'll email you a link to choose a new password.
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={error}
          hint={sent ? 'Check your inbox.' : undefined}
        />
        <Button label={sent ? 'Sent' : 'Send reset link'} disabled={sent} loading={loading} onPress={onSubmit} />
      </View>
    </Screen>
  );
};
