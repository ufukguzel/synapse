import {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Button, Card, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import type {MultipleChoicePayload} from '@/types';

export interface MultipleChoiceExerciseProps {
  prompt: string;
  payload: MultipleChoicePayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

export const MultipleChoiceExercise = ({prompt, payload, onSubmit}: MultipleChoiceExerciseProps) => {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = selectedId === payload.correctOptionId;

  const borderFor = (optionId: string) => {
    if (!checked) {
      return selectedId === optionId ? theme.colors.primary : theme.colors.border;
    }
    if (optionId === payload.correctOptionId) {
      return theme.colors.success;
    }
    return optionId === selectedId ? theme.colors.danger : theme.colors.border;
  };

  return (
    <View style={{gap: theme.spacing.base, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      <View style={{gap: theme.spacing.sm}}>
        {payload.options.map(option => (
          <Pressable key={option.id} disabled={checked} onPress={() => setSelectedId(option.id)}>
            <Card style={{borderColor: borderFor(option.id), borderWidth: 2}}>
              <Text variant="body">{option.label}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      {checked && !!payload.explanation && (
        <Text variant="caption" color={theme.colors.textSecondary}>
          {payload.explanation}
        </Text>
      )}

      <View style={{marginTop: 'auto'}}>
        {checked ? (
          <Button
            label="Continue"
            variant={isCorrect ? 'primary' : 'danger'}
            onPress={() => onSubmit(isCorrect, selectedId ?? '')}
          />
        ) : (
          <Button label="Check" disabled={!selectedId} onPress={() => setChecked(true)} />
        )}
      </View>
    </View>
  );
};
