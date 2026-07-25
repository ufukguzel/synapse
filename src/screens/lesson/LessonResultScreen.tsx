import {View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Card, Screen, Text} from '@/components';
import {useTheme} from '@/providers';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LessonResult'>;
type Route = RouteProp<RootStackParamList, 'LessonResult'>;

export const LessonResultScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();

  const percent = Math.round(params.accuracy * 100);

  return (
    <Screen>
      <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.lg}}>
        <Text variant="display" center>
          {percent >= 80 ? '🎉' : '💪'}
        </Text>
        <Text variant="h1" center>
          {percent >= 80 ? 'Lesson complete!' : 'Keep practising'}
        </Text>

        <Card style={{gap: theme.spacing.md}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text variant="body" color={theme.colors.textSecondary}>
              XP earned
            </Text>
            <Text variant="bodyStrong">+{params.xp}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text variant="body" color={theme.colors.textSecondary}>
              Accuracy
            </Text>
            <Text variant="bodyStrong">{percent}%</Text>
          </View>
        </Card>
      </View>

      <View style={{paddingBottom: theme.spacing.lg}}>
        <Button label="Done" onPress={() => navigation.navigate('Main', {screen: 'HomeTab'})} />
      </View>
    </Screen>
  );
};
