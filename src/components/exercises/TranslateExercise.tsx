import {useState} from 'react';
import {View} from 'react-native';
import {Badge, Button, Card, Input, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import {isAnswerCorrect} from '@/utils';
import type {TranslatePayload} from '@/types';
import {AnswerFeedback} from './AnswerFeedback';

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
    <View style={{gap: theme.spacing.lg, flex: 1}}>
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
      />

      {checked && (
        <AnswerFeedback isCorrect={correct} correctAnswer={payload.acceptedAnswers[0]} />
      )}

      <View style={{marginTop: 'auto'}}>
        {checked ? (
          <Button
            label="Continue"
            size="lg"
            variant={correct ? 'success' : 'danger'}
            onPress={() => onSubmit(correct, value)}
          />
        ) : (
          <Button label="Check" size="lg" disabled={!value.trim()} onPress={() => setChecked(true)} />
        )}
      </View>
    </View>
  );
};
