import {SectionList, Pressable, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card, EmptyState, ErrorView, LoadingView, Screen, Text} from '@/components';
import {coursesApi} from '@/api';
import {useUnits} from '@/hooks';
import {useTheme} from '@/providers';
import type {Lesson} from '@/types';
import type {RootStackParamList} from '@/navigation/types';
import {useQueries} from '@tanstack/react-query';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
type Route = RouteProp<RootStackParamList, 'CourseDetail'>;

export const CourseDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {params} = useRoute<Route>();

  const units = useUnits(params.courseId);
  const unitList = units.data ?? [];

  const lessonQueries = useQueries({
    queries: unitList.map(unit => ({
      queryKey: ['lessons', unit.id],
      queryFn: () => coursesApi.lessons(unit.id),
      enabled: !!unit.id,
    })),
  });

  if (units.isLoading) {
    return <LoadingView />;
  }
  if (units.isError) {
    return <ErrorView error={units.error} onRetry={units.refetch} />;
  }

  const sections = unitList.map((unit, index) => ({
    title: unit.title,
    data: (lessonQueries[index]?.data ?? []) as Lesson[],
  }));

  return (
    <Screen padded={false}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: theme.spacing.base, gap: theme.spacing.sm}}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<EmptyState title="No units yet" />}
        renderSectionHeader={({section}) => (
          <Text variant="h3" style={{marginTop: theme.spacing.base, marginBottom: theme.spacing.sm}}>
            {section.title}
          </Text>
        )}
        renderItem={({item}) => (
          <Pressable
            onPress={() => navigation.navigate('Lesson', {lessonId: item.id, title: item.title})}>
            <Card style={{marginBottom: theme.spacing.sm}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{flex: 1, gap: theme.spacing.xxs}}>
                  <Text variant="bodyStrong">{item.title}</Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    {item.kind} · {item.estimated_minutes} min · +{item.xp_reward} XP
                  </Text>
                </View>
                <Text variant="h3" color={theme.colors.textTertiary}>
                  ›
                </Text>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
};
