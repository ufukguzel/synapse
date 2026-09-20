import {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Text} from '@/components/ui';
import {useTheme} from '@/providers';

export interface AnswerFeedbackProps {
  isCorrect: boolean;
  explanation?: string | null;
  /** Shown when the answer was wrong, so the learner sees the target. */
  correctAnswer?: string;
}

/**
 * Shared correct/incorrect banner. Every exercise type used to style its own
 * feedback, so the same outcome looked different depending on the question.
 *
 * It springs up on mount, and a wrong answer adds a short horizontal shake, so
 * the outcome registers physically before the learner reads the words.
 */
export const AnswerFeedback = ({isCorrect, explanation, correctAnswer}: AnswerFeedbackProps) => {
  const theme = useTheme();
  // Calm coach, not a scoreboard: name what happened to the pathway.
  const tone = isCorrect
    ? {
        bg: theme.colors.successSoft,
        fg: theme.colors.success,
        icon: '✓',
        title: 'That pathway just got stronger',
      }
    : {
        bg: theme.colors.dangerSoft,
        fg: theme.colors.danger,
        icon: '✕',
        title: 'Not yet — here is the connection',
      };

  const enter = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    enter.value = withSpring(1, {damping: 14, stiffness: 180});
    if (!isCorrect) {
      shake.value = withSequence(
        withTiming(-1, {duration: 60}),
        withTiming(1, {duration: 60}),
        withTiming(-0.6, {duration: 60}),
        withTiming(0.6, {duration: 60}),
        withTiming(0, {duration: 60}),
      );
    }
    // Mount-only: each check remounts this component with a fresh key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      {translateY: (1 - enter.value) * 12},
      {scale: 0.96 + enter.value * 0.04},
      {translateX: shake.value * 6},
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: tone.bg,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.base,
          gap: theme.spacing.xs,
        },
        style,
      ]}>
      <View style={{gap: theme.spacing.xs}}>
        <Text variant="bodyStrong" color={tone.fg}>
          {tone.icon} {tone.title}
        </Text>
        {!isCorrect && !!correctAnswer && (
          <Text variant="body" color={theme.colors.text}>
            Answer: {correctAnswer}
          </Text>
        )}
        {!!explanation && (
          <Text variant="body" color={theme.colors.textSecondary}>
            {explanation}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};
