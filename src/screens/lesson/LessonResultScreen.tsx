import {View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Card, Screen, SynapseMark, Text} from '@/components';
import {useT, useTheme} from '@/providers';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LessonResult'>;
type Route = RouteProp<RootStackParamList, 'LessonResult'>;

export const LessonResultScreen = () => {
  const theme = useTheme();
  const {t} = useT();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();

  const percent = Math.round(params.accuracy * 100);
  const failed = params.failed === true;
  // complete_lesson only pays XP once, so a repeat run legitimately shows +0 -
  // call that out on purpose instead of letting it read as a broken reward.
  const isRepeat = !failed && params.isFirstCompletion === false;

  /**
   * Copy follows the brand voice: a calm coach describing what happened to the
   * learner's memory, not a scoreboard shouting at them.
   */
  const eyebrow = failed
    ? t('result.sessionEnded')
    : isRepeat
    ? t('result.practiceRound')
    : t('result.pathwayStrengthened');
  const heading = failed
    ? t('result.outOfHearts')
    : isRepeat
    ? t('result.alreadyMastered')
    : percent >= 80
    ? t('result.thatStuck')
    : t('result.forming');
  const subline = failed
    ? t('result.failedSub')
    : isRepeat
    ? t('result.repeatSub')
    : percent >= 80
    ? t('result.goodSub')
    : t('result.formingSub');

  return (
    <Screen>
      <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.lg}}>
        <View style={{alignItems: 'center', gap: theme.spacing.md}}>
          <SynapseMark size={72} variant={failed ? 'mono' : 'gradient'} color={theme.colors.textTertiary} />
          <Text variant="overline" color={failed ? theme.colors.textTertiary : theme.colors.success}>
            {eyebrow}
          </Text>
        </View>
        <Text variant="h1" center>
          {heading}
        </Text>
        <Text variant="bodyLg" center color={theme.colors.textSecondary}>
          {subline}
        </Text>

        {/* Two big numbers read faster than a label/value list on a reward screen. */}
        <View style={{flexDirection: 'row', gap: theme.spacing.md}}>
          <Card
            gradient={failed ? undefined : 'accent'}
            style={{flex: 1, alignItems: 'center', gap: theme.spacing.xxs}}>
            <Text variant="display" color={failed ? theme.colors.text : theme.palette.white}>
              +{params.xp}
            </Text>
            <Text
              variant="caption"
              color={failed ? theme.colors.textSecondary : 'rgba(255, 255, 255, 0.85)'}>
              {t('result.xpEarned')}
            </Text>
          </Card>
          <Card style={{flex: 1, alignItems: 'center', gap: theme.spacing.xxs}}>
            <Text variant="display">{percent}%</Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('result.accuracy')}
            </Text>
          </Card>
        </View>
      </View>

      <View style={{paddingBottom: theme.spacing.lg}}>
        <Button
          label={failed ? t('result.backToLessons') : t('result.done')}
          size="lg"
          variant={failed ? 'secondary' : 'primary'}
          onPress={() => navigation.navigate('Main', {screen: 'HomeTab'})}
        />
      </View>
    </Screen>
  );
};
