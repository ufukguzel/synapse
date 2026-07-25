import {useState} from 'react';
import {View} from 'react-native';
import {Button, Input, Screen, Text} from '@/components';
import {useAuth, useTheme} from '@/providers';
import {checkPassword, isValidEmail} from '@/utils';

export const SignUpScreen = () => {
  const theme = useTheme();
  const {signUp} = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    const check = checkPassword(password);
    if (!check.isValid) {
      setError(check.errors.join(' · '));
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim() || undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{gap: theme.spacing.lg, flex: 1, justifyContent: 'center'}}>
        <Text variant="h1">Create your account</Text>
        <Input label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
          error={error}
          hint="8+ characters, with a letter and a number."
        />
        <Button label="Create account" loading={loading} onPress={onSubmit} />
      </View>
    </Screen>
  );
};
