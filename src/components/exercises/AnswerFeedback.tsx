import {View} from 'react-native';
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

  return (
    <View
      style={{
        backgroundColor: tone.bg,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.base,
        gap: theme.spacing.xs,
      }}>
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
  );
};
