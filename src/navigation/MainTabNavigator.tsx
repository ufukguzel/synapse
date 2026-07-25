import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '@/providers';
import {HomeScreen} from '@/screens/home/HomeScreen';
import {PracticeScreen} from '@/screens/practice/PracticeScreen';
import {ProfileScreen} from '@/screens/profile/ProfileScreen';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: theme.textVariants.caption,
      }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{title: 'Learn'}} />
      <Tab.Screen name="PracticeTab" component={PracticeScreen} options={{title: 'Practice'}} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{title: 'Profile'}} />
    </Tab.Navigator>
  );
};
