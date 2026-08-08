import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Card, Screen, StatChip, Text} from '@/components';
import {useAvailableVocabulary, useDueVocabulary, useEnrollVocabulary} from '@/hooks';
import {useAuth, useTheme} from '@/providers';
import {pluralize} from '@/utils';
import type {RootStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BATCH_SIZE = 10;

export const PracticeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const {profile} = useAuth();

  const due = useDueVocabulary();
  const available = useAvailableVocabulary(profile?.current_level, BATCH_SIZE);
  const enroll = useEnrollVocabulary();

  const dueCount = due.data?.length ?? 0;
  const availableWords = available.data ?? [];

  const onAddWords = () => {
    if (!availableWords.length) {
      return;
    }
    enroll.mutate(availableWords.map(word => word.id));
  };

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.lg}}>
        <Text variant="display">Practice</Text>

        <Card gradient="brand" style={{gap: theme.spacing.base}}>
          <Text variant="h3" color={theme.palette.white}>
            Vocabulary review
          </Text>
          <Text variant="body" color="rgba(255, 255, 255, 0.85)">
            Spaced repetition brings words back right before you would forget them.
          </Text>
          <View style={{flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap'}}>
            <StatChip value={String(dueCount)} label="due now" onGradient />
            <StatChip value={String(availableWords.length)} label="new" onGradient />
          </View>
          <Button
            label={dueCount > 0 ? `Review ${pluralize(dueCount, 'word')}` : 'Nothing due yet'}
            variant="secondary"
            disabled={dueCount === 0}
            loading={due.isLoading}
            onPress={() => navigation.navigate('VocabularyReview')}
          />
        </Card>

        <Card style={{gap: theme.spacing.md}}>
          <Text variant="h3">Add new words</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            {availableWords.length > 0
              ? `${pluralize(availableWords.length, 'word')} at level ${
                  profile?.current_level ?? 'A1'
                } ready to start learning.`
              : 'You have started every word available at your level. New content will show up here.'}
          </Text>
          <Button
            label={
              availableWords.length > 0
                ? `Add ${pluralize(availableWords.length, 'word')} to review`
                : 'Nothing to add'
            }
            disabled={availableWords.length === 0}
            loading={enroll.isPending || available.isLoading}
            onPress={onAddWords}
          />
          {enroll.isError && (
            <Text variant="caption" color={theme.colors.danger}>
              Could not add the words. Please try again.
            </Text>
          )}
        </Card>

        <Card style={{gap: theme.spacing.sm}}>
          <Text variant="h3">Favorites</Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            The words you've starred, all in one place.
          </Text>
          <Button
            label="View favorites"
            variant="secondary"
            onPress={() => navigation.navigate('Favorites')}
            style={{marginTop: theme.spacing.sm}}
          />
        </Card>
      </View>
    </Screen>
  );
};
