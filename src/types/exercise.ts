import type {ExerciseKind} from './database.types';

export interface MultipleChoicePayload {
  options: {id: string; label: string; imageUrl?: string}[];
  correctOptionId: string;
  explanation?: string;
}

export interface FillBlankPayload {
  /** Sentence with `___` marking the blank(s). */
  template: string;
  answers: string[];
  choices?: string[];
}

export interface MatchPairsPayload {
  pairs: {left: string; right: string}[];
}

export interface WordOrderPayload {
  tokens: string[];
  correctOrder: number[];
}

export interface ListenTypePayload {
  expectedText: string;
  tolerance?: number;
}

export interface SpeakRepeatPayload {
  expectedText: string;
  minConfidence?: number;
}

export interface TranslatePayload {
  sourceText: string;
  acceptedAnswers: string[];
  direction: 'en-tr' | 'tr-en';
}

export type ExercisePayloadMap = {
  multiple_choice: MultipleChoicePayload;
  fill_blank: FillBlankPayload;
  match_pairs: MatchPairsPayload;
  word_order: WordOrderPayload;
  listen_type: ListenTypePayload;
  speak_repeat: SpeakRepeatPayload;
  translate: TranslatePayload;
};

export type TypedExercise<K extends ExerciseKind = ExerciseKind> = {
  id: string;
  lessonId: string;
  kind: K;
  prompt: string;
  payload: ExercisePayloadMap[K];
  audioUrl: string | null;
  imageUrl: string | null;
  orderIndex: number;
};

export type AnyExercise = {[K in ExerciseKind]: TypedExercise<K>}[ExerciseKind];

export interface ExerciseResult {
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  timeSpentMs: number;
}
