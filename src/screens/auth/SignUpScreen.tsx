import {useState} from 'react';
import {View} from 'react-native';
import {Button, Input, Screen, SynapseMark, Text} from '@/components';
import {useAuth, useT, useTheme} from '@/providers';
import {isSupabaseConfigured} from '@/services/supabase';
import {checkPassword, isValidEmail} from '@/utils';

/** Which field a message belongs under - 'form' covers whole-request failures. */
type FormError = {field: 'email' | 'password' | 'form'; message: string};

export const SignUpScreen = () => {
  const theme = useTheme();
  const {t} = useT();
  const {signUp} = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<FormError | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError({field: 'email', message: t('auth.invalidEmail')});
      return;
    }
    const check = checkPassword(password);
    if (!check.isValid) {
      setError({field: 'password', message: check.errors.join(' · ')});
      return;
    }
    if (!isSupabaseConfigured) {
      setError({field: 'form', message: t('auth.backendSignUp')});
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim() || undefined);
    } catch (e) {
      setError({
        field: 'form',
        message: e instanceof Error ? e.message : t('auth.couldNotCreate'),
      });
    } finally {
      setLoading(false);
    }
  };

  const errorFor = (field: FormError['field']) =>
    error?.field === field ? error.message : null;

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.xl}}>
      <View style={{gap: theme.spacing.lg, paddingTop: theme.spacing.xl}}>
        <View style={{gap: theme.spacing.sm, marginBottom: theme.spacing.sm}}>
          <SynapseMark size={48} />
          <Text variant="display">{t('signup.title')}</Text>
          <Text variant="bodyLg" color={theme.colors.textSecondary}>
            {t('signup.subtitle')}
          </Text>
        </View>
        <Input
          label={t('signup.name')}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('signup.namePlaceholder')}
        />
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={t('auth.emailPlaceholder')}
          error={errorFor('email')}
        />
        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={t('signup.passwordPlaceholder')}
          error={errorFor('password')}
          hint={t('signup.passwordHint')}
        />
        {!!errorFor('form') && (
          <View
            style={{
              backgroundColor: theme.colors.dangerSoft,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
            }}>
            <Text variant="body" color={theme.colors.danger}>
              {errorFor('form')}
            </Text>
          </View>
        )}
        <Button
          label={t('signup.create')}
          size="lg"
          loading={loading}
          onPress={onSubmit}
          style={{marginTop: theme.spacing.sm}}
        />
      </View>
    </Screen>
  );
};
