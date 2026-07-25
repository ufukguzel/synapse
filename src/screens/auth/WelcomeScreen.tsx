import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Screen, Text} from '@/components';
import {useTheme} from '@/providers';
import type {AuthStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <Screen>
      <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.md}}>
        <Text variant="display">Synapse</Text>
        <Text variant="bodyLg" color={theme.colors.textSecondary}>
          Learn English with short daily sessions built around how memory actually works.
        </Text>
      </View>
      <View style={{gap: theme.spacing.md, paddingBottom: theme.spacing.lg}}>
        <Button label="Get started" onPress={() => navigation.navigate('SignUp')} />
        <Button label="I already have an account" variant="ghost" onPress={() => navigation.navigate('SignIn')} />
      </View>
    </Screen>
  );
};
