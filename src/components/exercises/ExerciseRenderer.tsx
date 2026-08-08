import {EmptyState} from '@/components/common';
import type {AnyExercise} from '@/types';
import {FillBlankExercise} from './FillBlankExercise';
import {MultipleChoiceExercise} from './MultipleChoiceExercise';
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
    default:
      return (
        <EmptyState
          title="Coming soon"
          description={`The "${exercise.kind}" exercise type is not implemented yet.`}
          actionLabel="Skip"
          onAction={() => onSubmit(true, '')}
        />
      );
  }
};
