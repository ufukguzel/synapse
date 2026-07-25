import {useState} from 'react';
import {View} from 'react-native';
import {Button, Input, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import {isAnswerCorrect} from '@/utils';
import type {FillBlankPayload} from '@/types';

export interface FillBlankExerciseProps {
  prompt: string;
  payload: FillBlankPayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

export const FillBlankExercise = ({prompt, payload, onSubmit}: FillBlankExerciseProps) => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  const correct = isAnswerCorrect(value, payload.answers);

  return (
    <View style={{gap: theme.spacing.base, flex: 1}}>
      <Text variant="h2">{prompt}</Text>
      <Text variant="bodyLg" color={theme.colors.textSecondary}>
        {payload.template}
      </Text>

      <Input
        value={value}
        onChangeText={setValue}
        editable={!checked}
        autoCapitalize="none"
        placeholder="Your answer"
        error={checked && !correct ? `Correct: ${payload.answers[0]}` : null}
        hint={checked && correct ? 'Correct!' : undefined}
      />

      <View style={{marginTop: 'auto'}}>
        {checked ? (
          <Button
            label="Continue"
            variant={correct ? 'primary' : 'danger'}
            onPress={() => onSubmit(correct, value)}
          />
        ) : (
          <Button label="Check" disabled={!value.trim()} onPress={() => setChecked(true)} />
        )}
      </View>
    </View>
  );
};
