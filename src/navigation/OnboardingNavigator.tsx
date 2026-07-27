import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GoalSelectScreen} from '@/screens/onboarding/GoalSelectScreen';
import {LanguageSelectScreen} from '@/screens/onboarding/LanguageSelectScreen';
import {LevelSelectScreen} from '@/screens/onboarding/LevelSelectScreen';
import {ReminderSetupScreen} from '@/screens/onboarding/ReminderSetupScreen';
import type {OnboardingStackParamList} from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
    <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
    <Stack.Screen name="GoalSelect" component={GoalSelectScreen} />
    <Stack.Screen name="ReminderSetup" component={ReminderSetupScreen} />
  </Stack.Navigator>
);
