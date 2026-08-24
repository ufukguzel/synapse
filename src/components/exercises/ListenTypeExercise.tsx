import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Button, Card, Input, Text} from '@/components/ui';
import {useAudioPlayback} from '@/hooks';
import {useTheme} from '@/providers';
import {isAnswerCorrect} from '@/utils';
import type {ListenTypePayload} from '@/types';
import {AnswerFeedback} from './AnswerFeedback';

export interface ListenTypeExerciseProps {
  prompt: string;
  payload: ListenTypePayload;
  audioUrl: string | null;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

export const ListenTypeExercise = ({
  prompt,
  payload,
  audioUrl,
  onSubmit,
}: ListenTypeExerciseProps) => {
  const theme = useTheme();
  const audio = useAudioPlayback();
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  const canPlay = audio.isAvailable && !!audioUrl;
  const correct = isAnswerCorrect(value, [payload.expectedText], payload.tolerance);

  const autoPlayedRef = useRef(false);
  useEffect(() => {
    if (!canPlay || autoPlayedRef.current) {
      return;
    }
    autoPlayedRef.current = true;
    audio.play(audioUrl!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlay, audioUrl]);

  return (
    <View style={{gap: theme.spacing.lg, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      {canPlay ? (
        <Button
          label={audio.isPlaying ? '▶  Playing…' : '▶  Play again'}
          size="lg"
          variant="secondary"
          disabled={audio.isPlaying}
          onPress={() => audio.play(audioUrl!)}
        />
      ) : (
        // No clip or no audio driver: fall back to a spelling drill so the
        // lesson never dead-ends.
        <Card style={{gap: theme.spacing.xs}}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Audio unavailable — type the sentence below
          </Text>
          <Text variant="bodyLg">{payload.expectedText}</Text>
        </Card>
      )}

      <Input
        value={value}
        onChangeText={setValue}
        editable={!checked}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="What did you hear?"
        style={{height: 96, paddingTop: theme.spacing.md, textAlignVertical: 'top'}}
      />

      {checked && <AnswerFeedback isCorrect={correct} correctAnswer={payload.expectedText} />}

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
