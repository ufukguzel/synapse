import {useEffect} from 'react';
import {View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Button, Card, Screen, SynapseMark, Text} from '@/components';
import {useTheme} from '@/providers';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LessonResult'>;
type Route = RouteProp<RootStackParamList, 'LessonResult'>;

export const LessonResultScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();

  const percent = Math.round(params.accuracy * 100);
  const failed = params.failed === true;

  /**
   * Copy follows the brand voice: a calm coach describing what happened to the
   * learner's memory, not a scoreboard shouting at them.
   */
  const eyebrow = failed ? 'Session ended' : 'Pathway strengthened';
  const heading = failed
    ? 'Out of hearts'
    : percent >= 80
    ? 'That one stuck'
    : 'Pathway is forming';
  const subline = failed
    ? 'Nothing lost — the lesson stays open. Come back when you are ready.'
    : percent >= 80
    ? 'Nice — that pathway just got stronger. One more and it sticks.'
    : 'Some of it landed. A second pass will do the rest.';

  // The mark springs in as the reward beat; a soft halo blooms behind it on a win.
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSpring(1, {damping: 9, stiffness: 140, mass: 0.7});
  }, [pop]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{scale: 0.4 + pop.value * 0.6}],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: (failed ? 0.06 : 0.18) * pop.value,
    transform: [{scale: 0.6 + pop.value * 0.7}],
  }));

  return (
    <Screen>
      <View style={{flex: 1, justifyContent: 'center', gap: theme.spacing.lg}}>
        <View style={{alignItems: 'center', gap: theme.spacing.md}}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: failed ? theme.colors.textTertiary : theme.colors.success,
                },
                haloStyle,
              ]}
            />
            <Animated.View style={markStyle}>
              <SynapseMark
                size={72}
                variant={failed ? 'mono' : 'gradient'}
                color={theme.colors.textTertiary}
              />
            </Animated.View>
          </View>
          <Animated.View entering={FadeInUp.delay(220).duration(420)}>
            <Text
              variant="overline"
              center
              color={failed ? theme.colors.textTertiary : theme.colors.success}>
              {eyebrow}
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(300).duration(420)}>
          <Text variant="h1" center>
            {heading}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(380).duration(420)}>
          <Text variant="bodyLg" center color={theme.colors.textSecondary}>
            {subline}
          </Text>
        </Animated.View>

        {/* Two big numbers read faster than a label/value list on a reward screen. */}
        <Animated.View
          entering={FadeInUp.delay(480).duration(460)}
          style={{flexDirection: 'row', gap: theme.spacing.md}}>
          <Card
            gradient={failed ? undefined : 'accent'}
            style={{flex: 1, alignItems: 'center', gap: theme.spacing.xxs}}>
            <Text variant="display" color={failed ? theme.colors.text : theme.palette.white}>
              +{params.xp}
            </Text>
            <Text
              variant="caption"
              color={failed ? theme.colors.textSecondary : 'rgba(255, 255, 255, 0.85)'}>
              XP earned
            </Text>
          </Card>
          <Card style={{flex: 1, alignItems: 'center', gap: theme.spacing.xxs}}>
            <Text variant="display">{percent}%</Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              Accuracy
            </Text>
          </Card>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(620).duration(420)} style={{paddingBottom: theme.spacing.lg}}>
        <Button
          label={failed ? 'Back to lessons' : 'Done'}
          size="lg"
          variant={failed ? 'secondary' : 'primary'}
          onPress={() => navigation.navigate('Main', {screen: 'HomeTab'})}
        />
      </Animated.View>
    </Screen>
  );
};
