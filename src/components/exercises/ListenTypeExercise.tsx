import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Button, Card, Input, Text} from '@/components/ui';
import {useAudioPlayback} from '@/hooks';
import {useTheme} from '@/providers';
import {isAnswerCorrect} from '@/utils';
import type {ListenTypePayload} from '@/types';

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

  // Play the clip once when the exercise opens; replays are on the button.
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
    <View style={{gap: theme.spacing.base, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      {canPlay ? (
        <Button
          label={audio.isPlaying ? '▶  Playing…' : '▶  Play again'}
          variant="secondary"
          disabled={audio.isPlaying}
          onPress={() => audio.play(audioUrl!)}
        />
      ) : (
        // No clip or no audio driver on this build: fall back to a spelling
        // drill rather than dead-ending the lesson.
        <Card style={{gap: theme.spacing.xs}}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Audio unavailable — type the sentence below
          </Text>
          <Text variant="bodyLg">{payload.expectedText}</Text>
        </Card>
      )}

      {!!audio.error && (
        <Text variant="caption" color={theme.colors.danger}>
          Could not play the clip.
        </Text>
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
        error={checked && !correct ? `Correct: ${payload.expectedText}` : null}
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
