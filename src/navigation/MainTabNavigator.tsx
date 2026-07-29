import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {LearnIcon, PracticeIcon, ProfileIcon} from '@/components';
import {useTheme} from '@/providers';
import {HomeScreen} from '@/screens/home/HomeScreen';
import {PracticeScreen} from '@/screens/practice/PracticeScreen';
import {ProfileScreen} from '@/screens/profile/ProfileScreen';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Defined at module scope so the tab bar doesn't remount an icon on every render.
const renderLearnIcon = ({color}: {color: string}) => <LearnIcon color={color} size={24} />;
const renderPracticeIcon = ({color}: {color: string}) => <PracticeIcon color={color} size={24} />;
const renderProfileIcon = ({color}: {color: string}) => <ProfileIcon color={color} size={24} />;

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
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {...theme.textVariants.overline, textTransform: 'none'},
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{title: 'Learn', tabBarIcon: renderLearnIcon}}
      />
      <Tab.Screen
        name="PracticeTab"
        component={PracticeScreen}
        options={{title: 'Practice', tabBarIcon: renderPracticeIcon}}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{title: 'Profile', tabBarIcon: renderProfileIcon}}
      />
    </Tab.Navigator>
  );
};
