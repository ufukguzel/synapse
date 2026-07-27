import {Modal, Pressable, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Badge, Text} from '@/components/ui';
import {AVAILABLE_LEARNING_CODES, type LanguageOption} from '@/constants';
import {useTheme} from '@/providers';

export interface LanguagePickerProps {
  visible: boolean;
  title: string;
  options: LanguageOption[];
  selectedCode: string | null | undefined;
  onSelect: (code: string) => void;
  onClose: () => void;
  /**
   * When true, languages without content are listed but not selectable. Used for
   * the learning language, where only English has lessons today.
   */
  gateOnAvailability?: boolean;
}

/** Bottom-sheet style language chooser. */
export const LanguagePicker = ({
  visible,
  title,
  options,
  selectedCode,
  onSelect,
  onClose,
  gateOnAvailability = false,
}: LanguagePickerProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const isAvailable = (code: string) =>
    !gateOnAvailability || (AVAILABLE_LEARNING_CODES as readonly string[]).includes(code);

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
          maxHeight: '75%',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text variant="h3" style={{flex: 1}}>
            {title}
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
            <Text variant="bodyLg" color={theme.colors.textSecondary}>
              ✕
            </Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{gap: theme.spacing.sm}}>
            {options.map(option => {
              const selected = option.code === selectedCode;
              const available = isAvailable(option.code);
              return (
                <Pressable
                  key={option.code}
                  accessibilityRole="radio"
                  accessibilityState={{selected, disabled: !available}}
                  disabled={!available}
                  onPress={() => {
                    onSelect(option.code);
                    onClose();
                  }}
                  style={({pressed}) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    padding: theme.spacing.base,
                    borderRadius: theme.radius.card,
                    borderWidth: 1.5,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                    opacity: !available ? 0.55 : pressed ? 0.85 : 1,
                  })}>
                  <Text variant="h3">{option.flag}</Text>
                  <View style={{flex: 1, gap: theme.spacing.xxs}}>
                    <Text variant="bodyStrong">{option.nativeName}</Text>
                    <Text variant="caption" color={theme.colors.textTertiary}>
                      {option.englishName}
                    </Text>
                  </View>
                  {!available && <Badge label="Soon" tone="neutral" />}
                  {selected && available && (
                    <Text variant="bodyStrong" color={theme.colors.primary}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
