/**
 * Generated Supabase types.
 *
 * Regenerate after every migration:
 *   npx supabase gen types typescript --project-id <id> --schema public > src/types/database.types.ts
 *
 * The definitions below are hand-written to match supabase/migrations and act as
 * a stand-in until the CLI is wired up to the real project.
 */
export type Json = string | number | boolean | null | {[key: string]: Json | undefined} | Json[];

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LessonKind = 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'speaking' | 'writing';
export type ExerciseKind =
  | 'multiple_choice'
  | 'fill_blank'
  | 'match_pairs'
  | 'word_order'
  | 'listen_type'
  | 'speak_repeat'
  | 'translate';
export type ProgressStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  native_language: string;
  target_level: CefrLevel;
  current_level: CefrLevel;
  daily_goal_minutes: number;
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: CefrLevel;
  cover_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export type Unit = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  icon: string | null;
  created_at: string;
}

export type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  kind: LessonKind;
  order_index: number;
  xp_reward: number;
  estimated_minutes: number;
  is_published: boolean;
  created_at: string;
}

export type Exercise = {
  id: string;
  lesson_id: string;
  kind: ExerciseKind;
  prompt: string;
  /** Shape depends on `kind` - see src/types/exercise.ts */
  payload: Json;
  audio_url: string | null;
  image_url: string | null;
  order_index: number;
  created_at: string;
}

export type VocabularyItem = {
  id: string;
  headword: string;
  phonetic: string | null;
  meaning: string;
  translation: string | null;
  example_sentence: string | null;
  audio_url: string | null;
  image_url: string | null;
  level: CefrLevel;
  tags: string[];
  created_at: string;
}

export type UserLessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score: number | null;
  attempts: number;
  completed_at: string | null;
  updated_at: string;
}

/** Spaced-repetition (SM-2 style) review state per user/word. */
export type UserVocabulary = {
  id: string;
  user_id: string;
  vocabulary_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  last_reviewed_at: string | null;
  is_favorite: boolean;
}

export type UserStreak = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_xp: number;
  updated_at: string;
}

export type DailyActivity = {
  id: string;
  user_id: string;
  activity_date: string;
  minutes_studied: number;
  xp_earned: number;
  lessons_completed: number;
}

export type LessonVocabulary = {
  lesson_id: string;
  vocabulary_id: string;
  order_index: number;
}

/** Return shape of the `complete_lesson` RPC. */
export type CompleteLessonResult = {
  is_first_completion: boolean;
  xp_awarded: number;
  enrolled_count: number;
  streak: UserStreak;
}

/** One row of the `lesson_states` RPC — a lesson's gating state for the user. */
export type LessonState = {
  lesson_id: string;
  unit_id: string;
  seq: number;
  status: ProgressStatus;
  score: number | null;
  is_available: boolean;
}

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile, Partial<Profile> & {id: string}>;
      courses: TableDef<Course>;
      units: TableDef<Unit>;
      lessons: TableDef<Lesson>;
      exercises: TableDef<Exercise>;
      vocabulary_items: TableDef<VocabularyItem>;
      user_lesson_progress: TableDef<UserLessonProgress>;
      user_vocabulary: TableDef<UserVocabulary>;
      user_streaks: TableDef<UserStreak>;
      daily_activity: TableDef<DailyActivity>;
      lesson_vocabulary: TableDef<LessonVocabulary>;
    };
    Views: Record<string, never>;
    Functions: {
      record_activity: {
        Args: {p_minutes?: number; p_xp?: number; p_lessons?: number};
        Returns: UserStreak;
      };
      enroll_vocabulary: {
        Args: {p_vocabulary_id: string};
        Returns: UserVocabulary;
      };
      complete_lesson: {
        Args: {p_lesson_id: string; p_score?: number; p_minutes?: number};
        Returns: CompleteLessonResult;
      };
      lesson_states: {
        Args: {p_course_id: string};
        Returns: LessonState[];
      };
    };
    Enums: {
      cefr_level: CefrLevel;
      lesson_kind: LessonKind;
      exercise_kind: ExerciseKind;
      progress_status: ProgressStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
