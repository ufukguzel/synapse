import {useState} from 'react';
import {View} from 'react-native';
import {Button, Card, Text} from '@/components/ui';
import {useSpeechRecognition} from '@/hooks';
import {useTheme} from '@/providers';
import {isAnswerCorrect} from '@/utils';
import type {SpeakRepeatPayload} from '@/types';

export interface SpeakRepeatExerciseProps {
  prompt: string;
  payload: SpeakRepeatPayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

export const SpeakRepeatExercise = ({prompt, payload, onSubmit}: SpeakRepeatExerciseProps) => {
  const theme = useTheme();
  const speech = useSpeechRecognition();
  const [graded, setGraded] = useState<{isCorrect: boolean; transcript: string} | null>(null);

  const onListen = async () => {
    const heard = await speech.listen();
    if (!heard) {
      return;
    }
    const saidIt = isAnswerCorrect(heard.transcript, [payload.expectedText]);
    const confidentEnough = heard.confidence >= (payload.minConfidence ?? 0);
    setGraded({isCorrect: saidIt && confidentEnough, transcript: heard.transcript});
  };

  const retry = () => {
    setGraded(null);
    speech.reset();
  };

  return (
    <View style={{gap: theme.spacing.lg, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      <Card style={{gap: theme.spacing.xs}}>
        <Text variant="caption" color={theme.colors.textSecondary}>
          Say this out loud
        </Text>
        <Text variant="bodyLg">{payload.expectedText}</Text>
      </Card>

      {!!graded && (
        <Card
          style={{
            gap: theme.spacing.xs,
            borderColor: graded.isCorrect ? theme.colors.success : theme.colors.danger,
            borderWidth: 2,
          }}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            We heard
          </Text>
          <Text variant="body">{graded.transcript || '—'}</Text>
        </Card>
      )}

      {!!speech.error && (
        <Text variant="caption" color={theme.colors.danger}>
          Could not hear you. Check the microphone permission and try again.
        </Text>
      )}

      <View style={{marginTop: 'auto', gap: theme.spacing.sm}}>
        {!speech.isAvailable ? (
          // No recognizer on this build: let the learner self-assess rather
          // than blocking the lesson.
          <>
            <Text variant="caption" center color={theme.colors.textSecondary}>
              Speech check is unavailable on this build.
            </Text>
            <Button label="I said it" size="lg" onPress={() => onSubmit(true, payload.expectedText)} />
          </>
        ) : graded ? (
          <>
            <Button
              label="Continue"
              size="lg"
              variant={graded.isCorrect ? 'success' : 'danger'}
              onPress={() => onSubmit(graded.isCorrect, graded.transcript)}
            />
            {!graded.isCorrect && <Button label="Try again" variant="ghost" onPress={retry} />}
          </>
        ) : (
          <Button
            label={speech.isListening ? '🎤  Listening…' : '🎤  Tap to speak'}
            size="lg"
            loading={speech.isListening}
            onPress={onListen}
          />
        )}
      </View>
    </View>
  );
};
