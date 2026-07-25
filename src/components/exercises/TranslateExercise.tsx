import {useState} from 'react';
import {View} from 'react-native';
import {Badge, Button, Card, Input, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import {isAnswerCorrect} from '@/utils';
import type {TranslatePayload} from '@/types';

export interface TranslateExerciseProps {
  prompt: string;
  payload: TranslatePayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

const DIRECTION_LABEL: Record<TranslatePayload['direction'], string> = {
  'en-tr': 'English → Türkçe',
  'tr-en': 'Türkçe → English',
};

export const TranslateExercise = ({prompt, payload, onSubmit}: TranslateExerciseProps) => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  const correct = isAnswerCorrect(value, payload.acceptedAnswers);

  return (
    <View style={{gap: theme.spacing.base, flex: 1}}>
      <Text variant="h2">{prompt}</Text>
      <Badge label={DIRECTION_LABEL[payload.direction]} tone="primary" />

      <Card>
        <Text variant="bodyLg">{payload.sourceText}</Text>
      </Card>

      <Input
        value={value}
        onChangeText={setValue}
        editable={!checked}
        multiline
        autoCapitalize="none"
        placeholder="Your translation"
        style={{height: 96, paddingTop: theme.spacing.md, textAlignVertical: 'top'}}
        error={checked && !correct ? `Correct: ${payload.acceptedAnswers[0]}` : null}
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
