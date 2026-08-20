import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon, type IconName} from '@/components';
import {useT, useTheme} from '@/providers';
import {HomeScreen} from '@/screens/home/HomeScreen';
import {TasksScreen} from '@/screens/tasks/TasksScreen';
import {PracticeScreen} from '@/screens/practice/PracticeScreen';
import {ProfileScreen} from '@/screens/profile/ProfileScreen';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Without an explicit tabBarIcon React Navigation falls back to a placeholder
 * glyph. Selection is carried by tint only - the brand guide requires a single
 * icon weight with no filled variant.
 */
const tabIcon =
  (name: IconName) =>
  ({color}: {color: string}) => <Icon name={name} color={color} size={26} />;

export const MainTabNavigator = () => {
  const theme = useTheme();
  const {t} = useT();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 88,
          paddingTop: theme.spacing.sm,
        },
        tabBarLabelStyle: {
          ...theme.textVariants.caption,
          fontWeight: theme.fontWeight.semibold,
          marginTop: theme.spacing.xxs,
        },
        tabBarItemStyle: {paddingVertical: theme.spacing.xs},
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{title: t('tab.brain'), tabBarIcon: tabIcon('brain')}}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{title: t('tab.tasks'), tabBarIcon: tabIcon('tasks')}}
      />
      <Tab.Screen
        name="PracticeTab"
        component={PracticeScreen}
        options={{title: t('tab.practice'), tabBarIcon: tabIcon('practice')}}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{title: t('tab.profile'), tabBarIcon: tabIcon('profile')}}
      />
    </Tab.Navigator>
  );
};
