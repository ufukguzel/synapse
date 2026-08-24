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
 * Maps an exercise `kind` to its renderer. Add new exercise types here.
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
      // All seven kinds are handled above; this guards an unknown kind from the
      // server (e.g. a newer enum value than this build knows).
      return (
        <EmptyState
          title="Unsupported exercise"
          description={`This build cannot render the "${(exercise as AnyExercise).kind}" type.`}
          actionLabel="Skip"
          onAction={() => onSubmit(true, '')}
        />
      );
  }
};
