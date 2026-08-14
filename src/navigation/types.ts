import type {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  LanguageSelect: undefined;
  LevelSelect: undefined;
  GoalSelect: undefined;
  ReminderSetup: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  TasksTab: undefined;
  PracticeTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CourseDetail: {courseId: string; title?: string};
  Lesson: {
    lessonId: string;
    title?: string;
    /** Present when opened from the Tasks tab, so completion can close the task too. */
    taskId?: string;
  };
  LessonResult: {
    lessonId: string;
    /** Server-authoritative, from complete_lesson's xp_awarded - never the client's guess. */
    xp: number;
    accuracy: number;
    failed?: boolean;
    /** False on a repeat - explains why xp can be 0 even on a good run. */
    isFirstCompletion?: boolean;
  };
  VocabularyReview: {taskId?: string} | undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
