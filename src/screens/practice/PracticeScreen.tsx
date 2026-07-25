import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Card, Screen, Text} from '@/components';
import {useTheme} from '@/providers';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const PracticeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <Screen scroll>
      <View style={{gap: theme.spacing.base}}>
        <Text variant="h1">Practice</Text>
        <Card style={{gap: theme.spacing.sm}}>
          <Text variant="h3">Vocabulary review</Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Spaced repetition brings back the words you're about to forget.
          </Text>
          <Button
            label="Start review"
            onPress={() => navigation.navigate('VocabularyReview')}
            style={{marginTop: theme.spacing.sm}}
          />
        </Card>
      </View>
    </Screen>
  );
};
