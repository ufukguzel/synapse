import {useMemo, useState} from 'react';
import {Pressable, View} from 'react-native';
import {Button, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import type {WordOrderPayload} from '@/types';

export interface WordOrderExerciseProps {
  prompt: string;
  payload: WordOrderPayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

interface TokenChipProps {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

const TokenChip = ({label, disabled, onPress}: TokenChipProps) => {
  const theme = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled}}
      style={{
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceAlt,
      }}>
      <Text variant="body">{label}</Text>
    </Pressable>
  );
};

export const WordOrderExercise = ({prompt, payload, onSubmit}: WordOrderExerciseProps) => {
  const theme = useTheme();
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const remaining = useMemo(
    () => payload.tokens.map((_, i) => i).filter(i => !picked.includes(i)),
    [payload.tokens, picked],
  );

  const answer = picked.map(i => payload.tokens[i]).join(' ');
  const correct =
    picked.length === payload.correctOrder.length &&
    picked.every((value, index) => value === payload.correctOrder[index]);

  const borderColor = checked
    ? correct
      ? theme.colors.success
      : theme.colors.danger
    : theme.colors.border;

  return (
    <View style={{gap: theme.spacing.base, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      <View
        style={{
          minHeight: 72,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor,
          padding: theme.spacing.sm,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        }}>
        {picked.map(index => (
          <TokenChip
            key={`picked-${index}`}
            label={payload.tokens[index] ?? ''}
            disabled={checked}
            onPress={() => setPicked(prev => prev.filter(i => i !== index))}
          />
        ))}
      </View>

      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm}}>
        {remaining.map(index => (
          <TokenChip
            key={`pool-${index}`}
            label={payload.tokens[index] ?? ''}
            disabled={checked}
            onPress={() => setPicked(prev => [...prev, index])}
          />
        ))}
      </View>

      <View style={{marginTop: 'auto'}}>
        {checked ? (
          <Button
            label="Continue"
            variant={correct ? 'primary' : 'danger'}
            onPress={() => onSubmit(correct, answer)}
          />
        ) : (
          <Button label="Check" disabled={picked.length === 0} onPress={() => setChecked(true)} />
        )}
      </View>
    </View>
  );
};
