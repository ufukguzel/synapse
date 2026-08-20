import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoadingView} from '@/components';
import {useAuth, useT, useTheme} from '@/providers';
import {CourseDetailScreen} from '@/screens/home/CourseDetailScreen';
import {LessonResultScreen} from '@/screens/lesson/LessonResultScreen';
import {LessonScreen} from '@/screens/lesson/LessonScreen';
import {VocabularyReviewScreen} from '@/screens/practice/VocabularyReviewScreen';
import {SettingsScreen} from '@/screens/profile/SettingsScreen';
import {AuthNavigator} from './AuthNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {OnboardingNavigator} from './OnboardingNavigator';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const theme = useTheme();
  const {t} = useT();
  const {isLoading, isAuthenticated, profile} = useAuth();

  const navTheme = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  if (isLoading) {
    return <LoadingView message={t('nav.loading')} />;
  }

  const needsOnboarding = isAuthenticated && profile !== null && !profile.onboarding_completed;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
              options={({route}) => ({
                headerShown: true,
                title: route.params.title ?? t('nav.course'),
              })}
            />
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen
              name="LessonResult"
              component={LessonResultScreen}
              options={{presentation: 'modal'}}
            />
            <Stack.Screen
              name="VocabularyReview"
              component={VocabularyReviewScreen}
              options={{headerShown: true, title: t('nav.review')}}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{headerShown: true, title: t('nav.settings')}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
