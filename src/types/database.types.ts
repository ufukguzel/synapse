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
  /** ISO 639-1 code of the language being studied. */
  learning_language: string;
  /** ISO 639-1 code for interface copy. */
  ui_language: string;
  target_level: CefrLevel;
  current_level: CefrLevel;
  daily_goal_minutes: number;
  timezone: string;
  /** Local 'HH:MM:SS' for the streak reminder, or null when off. */
  reminder_time: string | null;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  haptics_enabled: boolean;
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

/** One of the five trainable brain regions. */
export type RegionCode = 'listening' | 'speaking' | 'reading' | 'writing' | 'memory';

export type SkillRegion = {
  code: RegionCode;
  title: string;
  description: string;
  /** Hex colour used for this region on the brain map. */
  accent: string;
  order_index: number;
};

export type UserRegionStrength = {
  user_id: string;
  region_code: RegionCode;
  /** 0..100 */
  strength: number;
  updated_at: string;
};

export type LearningGoal = {
  code: string;
  title: string;
  description: string;
  order_index: number;
};

export type TaskStatus = 'pending' | 'completed' | 'skipped';

export type DailyTask = {
  id: string;
  user_id: string;
  task_date: string;
  region_code: RegionCode;
  title: string;
  lesson_id: string | null;
  estimated_minutes: number;
  status: TaskStatus;
  order_index: number;
  completed_at: string | null;
  created_at: string;
};

/** Which words a lesson teaches; complete_lesson() enrols them into the SRS queue. */
export type LessonVocabulary = {
  lesson_id: string;
  vocabulary_id: string;
  order_index: number;
};

/** Returned by the complete_lesson RPC. */
export type LessonCompletionResult = {
  is_first_completion: boolean;
  /** Server-authoritative: comes from lessons.xp_reward, never the client. */
  xp_awarded: number;
  enrolled_count: number;
  streak: UserStreak;
};

/** One row per lesson from the lesson_states RPC, sequenced across the course. */
export type LessonState = {
  lesson_id: string;
  unit_id: string;
  seq: number;
  status: ProgressStatus;
  score: number | null;
  is_available: boolean;
};

/** Aggregate profile stats from the user_stats RPC - one round-trip. */
export type UserStats = {
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  minutes_today: number;
  minutes_week: number;
  lessons_completed: number;
  words_learned: number;
  words_due: number;
  words_favorite: number;
  daily_goal_minutes: number;
  goal_met_today: boolean;
};

export type CourseProgress = {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
};

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
      skill_regions: TableDef<SkillRegion>;
      user_region_strength: TableDef<UserRegionStrength>;
      learning_goals: TableDef<LearningGoal>;
      daily_tasks: TableDef<DailyTask>;
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
      strengthen_region: {
        Args: {p_region_code: string; p_amount?: number};
        Returns: UserRegionStrength;
      };
      complete_lesson: {
        Args: {p_lesson_id: string; p_score?: number; p_minutes?: number};
        Returns: LessonCompletionResult;
      };
      lesson_states: {
        Args: {p_course_id: string};
        Returns: LessonState[];
      };
      user_stats: {
        Args: Record<string, never>;
        Returns: UserStats;
      };
      course_progress: {
        Args: Record<string, never>;
        Returns: CourseProgress[];
      };
    };
    Enums: {
      cefr_level: CefrLevel;
      lesson_kind: LessonKind;
      exercise_kind: ExerciseKind;
      progress_status: ProgressStatus;
      task_status: TaskStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
