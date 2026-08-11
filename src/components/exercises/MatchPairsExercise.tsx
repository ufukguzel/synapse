import {useEffect, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {Button, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import type {MatchPairsPayload} from '@/types';

export interface MatchPairsExerciseProps {
  prompt: string;
  payload: MatchPairsPayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

/** How long a rejected pair stays highlighted before it clears. */
const WRONG_FLASH_MS = 600;

type Tone = 'idle' | 'selected' | 'matched' | 'wrong';

const shuffledIndexes = (n: number) => {
  const idx = Array.from({length: n}, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx;
};

const Tile = ({
  label,
  tone,
  disabled,
  onPress,
}: {
  label: string;
  tone: Tone;
  disabled?: boolean;
  onPress: () => void;
}) => {
  const theme = useTheme();
  const border: Record<Tone, string> = {
    idle: theme.colors.border,
    selected: theme.colors.primary,
    matched: theme.colors.success,
    wrong: theme.colors.danger,
  };
  const background: Record<Tone, string> = {
    idle: theme.colors.surface,
    selected: theme.colors.primarySoft,
    matched: theme.colors.successSoft,
    wrong: theme.colors.dangerSoft,
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled, selected: tone === 'selected'}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => ({
        flex: 1,
        minHeight: 56,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: border[tone],
        backgroundColor: background[tone],
        opacity: tone === 'matched' ? 0.6 : pressed ? 0.9 : 1,
      })}>
      <Text variant="body" center>
        {label}
      </Text>
    </Pressable>
  );
};

export const MatchPairsExercise = ({prompt, payload, onSubmit}: MatchPairsExerciseProps) => {
  const theme = useTheme();
  // Scramble the right column once so pairs don't line up by default.
  const [rightOrder] = useState(() => shuffledIndexes(payload.pairs.length));

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{left: number; right: number} | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (flashTimer.current) {
        clearTimeout(flashTimer.current);
      }
    },
    [],
  );

  const isDone = matched.length === payload.pairs.length;

  const onPressRight = (pairIndex: number) => {
    if (selectedLeft === null) {
      return;
    }
    if (selectedLeft === pairIndex) {
      setMatched(prev => [...prev, pairIndex]);
      setSelectedLeft(null);
      return;
    }
    setMistakes(prev => prev + 1);
    setWrong({left: selectedLeft, right: pairIndex});
    setSelectedLeft(null);
    flashTimer.current = setTimeout(() => setWrong(null), WRONG_FLASH_MS);
  };

  const leftTone = (i: number): Tone =>
    matched.includes(i) ? 'matched' : wrong?.left === i ? 'wrong' : selectedLeft === i ? 'selected' : 'idle';
  const rightTone = (i: number): Tone =>
    matched.includes(i) ? 'matched' : wrong?.right === i ? 'wrong' : 'idle';

  const answer = payload.pairs.map(p => `${p.left} = ${p.right}`).join(', ');

  return (
    <View style={{gap: theme.spacing.lg, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      <View style={{flexDirection: 'row', gap: theme.spacing.sm}}>
        <View style={{flex: 1, gap: theme.spacing.sm}}>
          {payload.pairs.map((pair, i) => (
            <Tile
              key={`l-${i}`}
              label={pair.left}
              tone={leftTone(i)}
              disabled={matched.includes(i)}
              onPress={() => setSelectedLeft(i)}
            />
          ))}
        </View>
        <View style={{flex: 1, gap: theme.spacing.sm}}>
          {rightOrder.map(i => (
            <Tile
              key={`r-${i}`}
              label={payload.pairs[i]?.right ?? ''}
              tone={rightTone(i)}
              disabled={matched.includes(i)}
              onPress={() => onPressRight(i)}
            />
          ))}
        </View>
      </View>

      {mistakes > 0 && (
        <Text variant="caption" color={theme.colors.textSecondary}>
          {mistakes} wrong {mistakes === 1 ? 'try' : 'tries'}
        </Text>
      )}

      <View style={{marginTop: 'auto'}}>
        <Button
          label="Continue"
          size="lg"
          variant={mistakes === 0 ? 'success' : 'danger'}
          disabled={!isDone}
          onPress={() => onSubmit(mistakes === 0, answer)}
        />
      </View>
    </View>
  );
};
