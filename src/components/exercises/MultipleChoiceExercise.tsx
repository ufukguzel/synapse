import {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Button, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import type {MultipleChoicePayload} from '@/types';
import {AnswerFeedback} from './AnswerFeedback';

export interface MultipleChoiceExerciseProps {
  prompt: string;
  payload: MultipleChoicePayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

export const MultipleChoiceExercise = ({
  prompt,
  payload,
  onSubmit,
}: MultipleChoiceExerciseProps) => {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = selectedId === payload.correctOptionId;

  /**
   * Options carry their state in the fill as well as the border - a 2px border
   * change alone is easy to miss, especially for the "this was the right answer"
   * row the learner did not pick.
   */
  const toneFor = (optionId: string) => {
    if (!checked) {
      const selected = selectedId === optionId;
      return {
        border: selected ? theme.colors.primary : theme.colors.border,
        background: selected ? theme.colors.primarySoft : theme.colors.surface,
        text: theme.colors.text,
      };
    }
    if (optionId === payload.correctOptionId) {
      return {
        border: theme.colors.success,
        background: theme.colors.successSoft,
        text: theme.colors.text,
      };
    }
    if (optionId === selectedId) {
      return {
        border: theme.colors.danger,
        background: theme.colors.dangerSoft,
        text: theme.colors.text,
      };
    }
    return {
      border: theme.colors.border,
      background: theme.colors.surface,
      text: theme.colors.textTertiary,
    };
  };

  return (
    <View style={{gap: theme.spacing.lg, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      <View style={{gap: theme.spacing.md}}>
        {payload.options.map(option => {
          const tone = toneFor(option.id);
          return (
            <Pressable
              key={option.id}
              disabled={checked}
              onPress={() => setSelectedId(option.id)}
              style={({pressed}) => ({
                borderColor: tone.border,
                backgroundColor: tone.background,
                borderWidth: 2,
                borderRadius: theme.radius.lg,
                paddingVertical: theme.spacing.base,
                paddingHorizontal: theme.spacing.base,
                opacity: pressed ? 0.9 : 1,
              })}>
              <Text variant="bodyLg" color={tone.text}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {checked && <AnswerFeedback isCorrect={isCorrect} explanation={payload.explanation} />}

      <View style={{marginTop: 'auto'}}>
        {checked ? (
          <Button
            label="Continue"
            size="lg"
            variant={isCorrect ? 'success' : 'danger'}
            onPress={() => onSubmit(isCorrect, selectedId ?? '')}
          />
        ) : (
          <Button label="Check" size="lg" disabled={!selectedId} onPress={() => setChecked(true)} />
        )}
      </View>
    </View>
  );
};
