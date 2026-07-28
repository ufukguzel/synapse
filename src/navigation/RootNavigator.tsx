import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoadingView} from '@/components';
import {useAuth, useTheme} from '@/providers';
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
    return <LoadingView message="Loading Synapse…" />;
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
              options={({route}) => ({headerShown: true, title: route.params.title ?? 'Course'})}
            />
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen
              name="LessonResult"
              component={LessonResultScreen}
              // Slides up like a modal but stays a normal card so the finished
              // Lesson can be `replace`d cleanly. `replace` into a real
              // `presentation: 'modal'` screen makes native-stack dismiss the
              // outgoing card and present a modal at once, which leaves the two
              // stacked on top of each other during the transition. The bottom
              // slide keeps the celebratory feel without that contradiction;
              // the screen is full-bleed so nothing shows behind it, and the
              // back gesture is off since the lesson underneath is already gone.
              options={{animation: 'slide_from_bottom', gestureEnabled: false}}
            />
            <Stack.Screen
              name="VocabularyReview"
              component={VocabularyReviewScreen}
              options={{headerShown: true, title: 'Review'}}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{headerShown: true, title: 'Settings'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
