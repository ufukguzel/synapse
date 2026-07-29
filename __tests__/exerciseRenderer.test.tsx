import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {ExerciseRenderer} from '../src/components/exercises';
import {ThemeProvider} from '../src/providers/ThemeProvider';
import type {AnyExercise, ExerciseKind} from '../src/types';

const base = {
  id: 'ex-1',
  lessonId: 'lesson-1',
  prompt: 'Prompt text',
  audioUrl: null,
  imageUrl: null,
  orderIndex: 1,
};

const PAYLOADS: Record<ExerciseKind, unknown> = {
  multiple_choice: {
    options: [
      {id: 'a', label: 'Alpha'},
      {id: 'b', label: 'Beta'},
    ],
    correctOptionId: 'a',
    explanation: 'Because A.',
  },
  fill_blank: {template: '___ morning', answers: ['good']},
  word_order: {tokens: ['nice', 'to', 'meet'], correctOrder: [0, 1, 2]},
  match_pairs: {
    pairs: [
      {left: 'one', right: 'bir'},
      {left: 'two', right: 'iki'},
    ],
  },
  translate: {sourceText: 'Merhaba', acceptedAnswers: ['Hello'], direction: 'tr-en'},
  listen_type: {expectedText: 'Where are you from?', tolerance: 1},
  speak_repeat: {expectedText: 'Nice to meet you.', minConfidence: 0.6},
};

const renderExercise = (kind: ExerciseKind) => {
  const exercise = {...base, kind, payload: PAYLOADS[kind]} as AnyExercise;
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(
      <ThemeProvider>
        <ExerciseRenderer exercise={exercise} onSubmit={() => {}} />
      </ThemeProvider>,
    );
  });
  return tree;
};

describe('ExerciseRenderer', () => {
  const kinds: ExerciseKind[] = [
    'multiple_choice',
    'fill_blank',
    'word_order',
    'match_pairs',
    'translate',
    'listen_type',
    'speak_repeat',
  ];

  it.each(kinds)('mounts the %s exercise without throwing', kind => {
    const tree = renderExercise(kind);
    expect(tree.toJSON()).toBeTruthy();
    act(() => tree.unmount());
  });
});
