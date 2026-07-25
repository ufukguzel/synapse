import {useEffect, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {Button, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import {shuffle} from '@/utils';
import type {MatchPairsPayload} from '@/types';

export interface MatchPairsExerciseProps {
  prompt: string;
  payload: MatchPairsPayload;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

/** How long a rejected pair stays highlighted before it resets. */
const WRONG_FLASH_MS = 600;

type Tone = 'idle' | 'selected' | 'matched' | 'wrong';

interface PairTileProps {
  label: string;
  tone: Tone;
  disabled?: boolean;
  onPress: () => void;
}

const PairTile = ({label, tone, disabled, onPress}: PairTileProps) => {
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
      accessibilityState={{disabled, selected: tone === 'selected'}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => ({
        flex: 1,
        minHeight: 56,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        borderWidth: 2,
        borderColor: border[tone],
        backgroundColor: background[tone],
        opacity: tone === 'matched' ? 0.6 : pressed ? 0.85 : 1,
      })}>
      <Text variant="body" center>
        {label}
      </Text>
    </Pressable>
  );
};

export const MatchPairsExercise = ({prompt, payload, onSubmit}: MatchPairsExerciseProps) => {
  const theme = useTheme();

  // The right column is scrambled once per mount, otherwise every pair would
  // sit on the row it belongs to and there would be nothing to solve.
  const [rightOrder] = useState(() => shuffle(payload.pairs.map((_, index) => index)));

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

  const leftTone = (pairIndex: number): Tone => {
    if (matched.includes(pairIndex)) {
      return 'matched';
    }
    if (wrong?.left === pairIndex) {
      return 'wrong';
    }
    return selectedLeft === pairIndex ? 'selected' : 'idle';
  };

  const rightTone = (pairIndex: number): Tone => {
    if (matched.includes(pairIndex)) {
      return 'matched';
    }
    return wrong?.right === pairIndex ? 'wrong' : 'idle';
  };

  const answer = payload.pairs.map(pair => `${pair.left} = ${pair.right}`).join(', ');

  return (
    <View style={{gap: theme.spacing.base, flex: 1}}>
      <Text variant="h2">{prompt}</Text>

      <View style={{flexDirection: 'row', gap: theme.spacing.sm}}>
        <View style={{flex: 1, gap: theme.spacing.sm}}>
          {payload.pairs.map((pair, pairIndex) => (
            <PairTile
              key={`left-${pairIndex}`}
              label={pair.left}
              tone={leftTone(pairIndex)}
              disabled={matched.includes(pairIndex)}
              onPress={() => setSelectedLeft(pairIndex)}
            />
          ))}
        </View>

        <View style={{flex: 1, gap: theme.spacing.sm}}>
          {rightOrder.map(pairIndex => (
            <PairTile
              key={`right-${pairIndex}`}
              label={payload.pairs[pairIndex]?.right ?? ''}
              tone={rightTone(pairIndex)}
              disabled={matched.includes(pairIndex)}
              onPress={() => onPressRight(pairIndex)}
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
          variant={mistakes === 0 ? 'primary' : 'danger'}
          disabled={!isDone}
          onPress={() => onSubmit(mistakes === 0, answer)}
        />
      </View>
    </View>
  );
};
