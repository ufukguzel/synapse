import {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Input, Screen, SynapseMark, Text} from '@/components';
import {useAuth, useTheme} from '@/providers';
import {isSupabaseConfigured} from '@/services/supabase';
import {isValidEmail} from '@/utils';
import type {AuthStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

/** Which field a message belongs under - 'form' covers whole-request failures. */
type FormError = {field: 'email' | 'password' | 'form'; message: string};

export const SignInScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {signIn} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<FormError | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError({field: 'email', message: 'Enter a valid email address.'});
      return;
    }
    if (!password) {
      setError({field: 'password', message: 'Enter your password.'});
      return;
    }
    if (!isSupabaseConfigured) {
      setError({field: 'form', message: 'Backend is not configured yet, so sign-in is unavailable.'});
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError({field: 'form', message: e instanceof Error ? e.message : 'Could not sign in.'});
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
          <Text variant="display">Welcome back</Text>
          <Text variant="bodyLg" color={theme.colors.textSecondary}>
            Pick up where you left off.
          </Text>
        </View>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
          error={errorFor('email')}
        />
        <Input
          label="Password"
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
          label="Sign in"
          size="lg"
          loading={loading}
          onPress={onSubmit}
          style={{marginTop: theme.spacing.sm}}
        />
        <Button
          label="Forgot password?"
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </View>
    </Screen>
  );
};
