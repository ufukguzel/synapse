import {useState} from 'react';
import {View} from 'react-native';
import {Button, Input, Screen, Text} from '@/components';
import {authService} from '@/services/supabase';
import {useT, useTheme} from '@/providers';
import {isValidEmail} from '@/utils';

export const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const {t} = useT();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError(t('auth.invalidEmail'));
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
        <Text variant="h1">{t('forgot.title')}</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          {t('forgot.subtitle')}
        </Text>
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={error}
          hint={sent ? t('forgot.inboxHint') : undefined}
        />
        <Button
          label={sent ? t('forgot.sent') : t('forgot.send')}
          disabled={sent}
          loading={loading}
          onPress={onSubmit}
        />
      </View>
    </Screen>
  );
};
