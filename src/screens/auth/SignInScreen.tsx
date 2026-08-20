import {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Input, Screen, SynapseMark, Text} from '@/components';
import {useAuth, useT, useTheme} from '@/providers';
import {isSupabaseConfigured} from '@/services/supabase';
import {isValidEmail} from '@/utils';
import type {AuthStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

/** Which field a message belongs under - 'form' covers whole-request failures. */
type FormError = {field: 'email' | 'password' | 'form'; message: string};

export const SignInScreen = () => {
  const theme = useTheme();
  const {t} = useT();
  const navigation = useNavigation<Nav>();
  const {signIn} = useAuth();

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
    if (!password) {
      setError({field: 'password', message: t('auth.enterPassword')});
      return;
    }
    if (!isSupabaseConfigured) {
      setError({field: 'form', message: t('auth.backendSignIn')});
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError({field: 'form', message: e instanceof Error ? e.message : t('auth.couldNotSignIn')});
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
          <Text variant="display">{t('signin.title')}</Text>
          <Text variant="bodyLg" color={theme.colors.textSecondary}>
            {t('signin.subtitle')}
          </Text>
        </View>
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          error={errorFor('email')}
        />
        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="••••••••"
          error={errorFor('password')}
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
          label={t('signin.signIn')}
          size="lg"
          loading={loading}
          onPress={onSubmit}
          style={{marginTop: theme.spacing.sm}}
        />
        <Button
          label={t('signin.forgot')}
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </View>
    </Screen>
  );
};
