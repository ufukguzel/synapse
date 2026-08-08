import {useState} from 'react';
import {View} from 'react-native';
import {Button, Input, Screen, SynapseMark, Text} from '@/components';
import {useAuth, useTheme} from '@/providers';
import {isSupabaseConfigured} from '@/services/supabase';
import {checkPassword, isValidEmail} from '@/utils';

/** Which field a message belongs under - 'form' covers whole-request failures. */
type FormError = {field: 'email' | 'password' | 'form'; message: string};

export const SignUpScreen = () => {
  const theme = useTheme();
  const {signUp} = useAuth();

  const [displayName, setDisplayName] = useState('');
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
    const check = checkPassword(password);
    if (!check.isValid) {
      setError({field: 'password', message: check.errors.join(' · ')});
      return;
    }
    if (!isSupabaseConfigured) {
      setError({
        field: 'form',
        message: 'Backend is not configured yet, so accounts cannot be created.',
      });
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim() || undefined);
    } catch (e) {
      setError({
        field: 'form',
        message: e instanceof Error ? e.message : 'Could not create the account.',
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
          <Text variant="display">Create your account</Text>
          <Text variant="bodyLg" color={theme.colors.textSecondary}>
            Five minutes a day is all it takes to start.
          </Text>
        </View>
        <Input label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          error={errorFor('email')}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
          error={errorFor('password')}
          hint="8+ characters, with a letter and a number."
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
          label="Create account"
          size="lg"
          loading={loading}
          onPress={onSubmit}
          style={{marginTop: theme.spacing.sm}}
        />
      </View>
    </Screen>
  );
};
