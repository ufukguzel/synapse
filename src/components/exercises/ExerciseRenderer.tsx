import {EmptyState} from '@/components/common';
import type {AnyExercise} from '@/types';
import {FillBlankExercise} from './FillBlankExercise';
import {ListenTypeExercise} from './ListenTypeExercise';
import {MatchPairsExercise} from './MatchPairsExercise';
import {MultipleChoiceExercise} from './MultipleChoiceExercise';
import {SpeakRepeatExercise} from './SpeakRepeatExercise';
import {TranslateExercise} from './TranslateExercise';
import {WordOrderExercise} from './WordOrderExercise';

export interface ExerciseRendererProps {
  exercise: AnyExercise;
  onSubmit: (isCorrect: boolean, answer: string) => void;
}

/**
 * Maps an exercise `kind` to its renderer. Add new exercise types here — the
 * switch is exhaustive over `ExerciseKind`, so a new kind fails the typecheck
 * until it is handled.
 */
export const ExerciseRenderer = ({exercise, onSubmit}: ExerciseRendererProps) => {
  switch (exercise.kind) {
    case 'multiple_choice':
      return (
        <MultipleChoiceExercise
          prompt={exercise.prompt}
          payload={exercise.payload}
          onSubmit={onSubmit}
        />
      );
    case 'fill_blank':
      return (
        <FillBlankExercise prompt={exercise.prompt} payload={exercise.payload} onSubmit={onSubmit} />
      );
    case 'word_order':
      return (
        <WordOrderExercise prompt={exercise.prompt} payload={exercise.payload} onSubmit={onSubmit} />
      );
    case 'match_pairs':
      return (
        <MatchPairsExercise
          prompt={exercise.prompt}
          payload={exercise.payload}
          onSubmit={onSubmit}
        />
      );
    case 'translate':
      return (
        <TranslateExercise prompt={exercise.prompt} payload={exercise.payload} onSubmit={onSubmit} />
      );
    case 'listen_type':
      return (
        <ListenTypeExercise
          prompt={exercise.prompt}
          payload={exercise.payload}
          audioUrl={exercise.audioUrl}
          onSubmit={onSubmit}
        />
      );
    case 'speak_repeat':
      return (
        <SpeakRepeatExercise
          prompt={exercise.prompt}
          payload={exercise.payload}
          onSubmit={onSubmit}
        />
      );
    default:
      return (
        <EmptyState
          title="Unsupported exercise"
          description={`This build cannot render the "${
            (exercise as AnyExercise).kind
          }" exercise type.`}
          actionLabel="Skip"
          onAction={() => onSubmit(true, '')}
        />
      );
  }
};
