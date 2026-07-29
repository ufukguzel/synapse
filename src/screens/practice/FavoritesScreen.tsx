import {useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Card, EmptyState, ErrorView, LoadingView, Screen, Text} from '@/components';
import {useFavorites, useToggleFavorite} from '@/hooks';
import {useTheme} from '@/providers';

export const FavoritesScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const favorites = useFavorites();
  const toggleFavorite = useToggleFavorite();

  // Hide a row the instant its star is tapped, before the refetch lands.
  const [removed, setRemoved] = useState<Record<string, boolean>>({});

  if (favorites.isLoading) {
    return <LoadingView />;
  }
  if (favorites.isError) {
    return <ErrorView error={favorites.error} onRetry={favorites.refetch} />;
  }

  const items = (favorites.data ?? []).filter(item => !removed[item.id]);

  if (!items.length) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Tap the star on a word during review to save it here."
        actionLabel="Go back"
        onAction={navigation.goBack}
      />
    );
  }

  const onUnfavorite = (id: string) => {
    setRemoved(prev => ({...prev, [id]: true}));
    toggleFavorite.mutate({id, isFavorite: false});
  };

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: theme.spacing.base, gap: theme.spacing.sm}}
        renderItem={({item}) => {
          const word = item.vocabulary_items;
          return (
            <Card>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}>
                <View style={{flex: 1, gap: theme.spacing.xxs}}>
                  <Text variant="bodyStrong">{word?.headword ?? '—'}</Text>
                  {!!word?.meaning && (
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {word.meaning}
                    </Text>
                  )}
                  {!!word?.translation && (
                    <Text variant="caption" color={theme.colors.textTertiary}>
                      {word.translation}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => onUnfavorite(item.id)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from favorites">
                  <Text variant="h3" color={theme.colors.accent}>
                    ★
                  </Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
};
