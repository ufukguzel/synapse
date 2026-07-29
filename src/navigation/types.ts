import type {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  LevelSelect: undefined;
  GoalSelect: undefined;
  ReminderSetup: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  PracticeTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CourseDetail: {courseId: string; title?: string};
  Lesson: {lessonId: string; title?: string};
  LessonResult: {lessonId: string; xp: number; accuracy: number};
  VocabularyReview: undefined;
  Favorites: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
