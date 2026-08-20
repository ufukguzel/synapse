import {Modal, Pressable, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ProgressBar, Text} from '@/components/ui';
import {useTheme} from '@/providers';
import type {ProgressStatus, RegionCode} from '@/types';

export interface RegionLessonItem {
  id: string;
  title: string;
  status: ProgressStatus;
  estimatedMinutes: number;
  xpReward: number;
}

export interface RegionDetailSheetProps {
  visible: boolean;
  region: {code: RegionCode; title: string; description: string; strength: number; accent: string} | null;
  lessons: RegionLessonItem[];
  onSelectLesson: (lessonId: string) => void;
  onClose: () => void;
}

const STATUS_GLYPH: Record<ProgressStatus, string> = {
  completed: '✓',
  available: '→',
  in_progress: '→',
  locked: '🔒',
};

/**
 * Opens when a brain region is tapped. Names what the region trains, how
 * strong it is, and exactly which lessons feed it - so the map is a way in to
 * the content, not a picture with no door.
 */
export const RegionDetailSheet = ({
  visible,
  region,
  lessons,
  onSelectLesson,
  onClose,
}: RegionDetailSheetProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!region) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{flex: 1, backgroundColor: theme.colors.overlay}} onPress={onClose} />
      <View
        style={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
          paddingTop: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.lg,
          paddingHorizontal: theme.spacing.base,
          gap: theme.spacing.base,
          maxHeight: '80%',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md}}>
          <View style={{flex: 1, gap: theme.spacing.xxs}}>
            <Text variant="overline" color={region.accent}>
              {Math.round(region.strength)}% strength
            </Text>
            <Text variant="h2">{region.title}</Text>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
            <Text variant="bodyLg" color={theme.colors.textSecondary}>
              ✕
            </Text>
          </Pressable>
        </View>

        <ProgressBar value={region.strength / 100} fillColor={region.accent} />

        <Text variant="body" color={theme.colors.textSecondary}>
          {region.description}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{gap: theme.spacing.sm}}>
            {lessons.length === 0 && (
              <Text variant="body" color={theme.colors.textTertiary}>
                No lessons train this region yet.
              </Text>
            )}
            {lessons.map(lesson => {
              const locked = lesson.status === 'locked';
              return (
                <Pressable
                  key={lesson.id}
                  disabled={locked}
                  onPress={() => onSelectLesson(lesson.id)}
                  accessibilityRole="button"
                  accessibilityState={{disabled: locked}}
                  style={({pressed}) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    padding: theme.spacing.base,
                    borderRadius: theme.radius.card,
                    borderWidth: 1.5,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    opacity: locked ? 0.55 : pressed ? 0.85 : 1,
                  })}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: theme.radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        lesson.status === 'completed' ? region.accent : theme.colors.surfaceAlt,
                    }}>
                    <Text
                      variant="caption"
                      color={
                        lesson.status === 'completed' ? theme.colors.onPrimary : theme.colors.textTertiary
                      }>
                      {STATUS_GLYPH[lesson.status]}
                    </Text>
                  </View>
                  <View style={{flex: 1, gap: theme.spacing.xxs}}>
                    <Text variant="bodyStrong">{lesson.title}</Text>
                    <Text variant="caption" color={theme.colors.textTertiary}>
                      {locked
                        ? 'Locked'
                        : `${lesson.status === 'in_progress' ? 'Continue · ' : ''}${lesson.estimatedMinutes} min · +${lesson.xpReward} XP`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
