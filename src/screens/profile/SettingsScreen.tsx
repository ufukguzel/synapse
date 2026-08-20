import {useState} from 'react';
import {Alert, View} from 'react-native';
import {
  Badge,
  Button,
  LanguagePicker,
  OptionRow,
  Screen,
  SettingsGroup,
  SettingsNavRow,
  SettingsToggleRow,
  Text,
} from '@/components';
import {
  APP_NAME,
  DAILY_GOAL_OPTIONS,
  LEARNING_LANGUAGES,
  NATIVE_LANGUAGES,
  UI_LANGUAGES,
  findLanguage,
} from '@/constants';
import {useUpdateProfile} from '@/hooks';
import {useAuth, useT, useTheme, type ThemePreference} from '@/providers';
import type {TranslationKey} from '@/i18n';
import type {Profile} from '@/types';

type PickerKind = 'learning' | 'ui' | 'native' | null;

const THEME_OPTIONS: {
  value: ThemePreference;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}[] = [
  {value: 'brand', titleKey: 'settings.themeDeepSpace', descriptionKey: 'settings.themeDeepSpaceDesc'},
  {value: 'light', titleKey: 'settings.themeLight', descriptionKey: 'settings.themeLightDesc'},
  {value: 'system', titleKey: 'settings.themeSystem', descriptionKey: 'settings.themeSystemDesc'},
];

const APP_VERSION = '0.1.0';

export const SettingsScreen = () => {
  const theme = useTheme();
  const {t, formatMinutes} = useT();
  const {signOut, user, profile} = useAuth();
  const updateProfile = useUpdateProfile();

  const [picker, setPicker] = useState<PickerKind>(null);
  const [expanded, setExpanded] = useState<'theme' | 'goal' | null>(null);

  /** Every setting writes straight through to the profile so it follows the account. */
  const save = (patch: Partial<Profile>) => {
    updateProfile.mutate(patch, {
      onError: error =>
        Alert.alert(
          t('settings.couldNotSave'),
          error instanceof Error ? error.message : t('settings.tryAgain'),
        ),
    });
  };

  const learning = findLanguage(LEARNING_LANGUAGES, profile?.learning_language);
  const ui = findLanguage(UI_LANGUAGES, profile?.ui_language);
  const native = findLanguage(NATIVE_LANGUAGES, profile?.native_language);

  const confirmSignOut = () => {
    Alert.alert(t('settings.signOutTitle'), t('settings.signOutBody'), [
      {text: t('settings.signOutCancel'), style: 'cancel'},
      {
        text: t('settings.signOutConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert(
              t('settings.signOutFailed'),
              error instanceof Error ? error.message : t('settings.tryAgain'),
            );
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll contentContainerStyle={{padding: theme.spacing.base}}>
      <View style={{gap: theme.spacing.xl}}>
        {/* ---- Learning ---------------------------------------------------- */}
        <SettingsGroup title={t('settings.learning')} footer={t('settings.learningFooter')}>
          <SettingsNavRow
            icon={learning?.flag}
            label={t('settings.imLearning')}
            description={learning?.englishName}
            value={learning?.nativeName ?? '—'}
            onPress={() => setPicker('learning')}
          />
          <Hairline />
          <SettingsNavRow
            icon={native?.flag}
            label={t('settings.myLanguage')}
            description={t('settings.myLanguageDesc')}
            value={native?.nativeName ?? '—'}
            onPress={() => setPicker('native')}
          />
          <Hairline />
          <SettingsNavRow
            label={t('settings.dailyGoal')}
            value={formatMinutes(profile?.daily_goal_minutes ?? 10)}
            onPress={() => setExpanded(expanded === 'goal' ? null : 'goal')}
          />
        </SettingsGroup>

        {expanded === 'goal' && (
          <View style={{gap: theme.spacing.sm}}>
            {DAILY_GOAL_OPTIONS.map(option => (
              <OptionRow
                key={option}
                title={t('settings.goalPerDay', {minutes: formatMinutes(option)})}
                selected={(profile?.daily_goal_minutes ?? 10) === option}
                onPress={() => save({daily_goal_minutes: option})}
              />
            ))}
          </View>
        )}

        {/* ---- Level ------------------------------------------------------- */}
        <SettingsGroup title={t('settings.level')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              gap: theme.spacing.md,
            }}>
            <View style={{flex: 1, gap: theme.spacing.xxs}}>
              <Text variant="bodyStrong">{t('settings.currentLevel')}</Text>
              <Text variant="caption" color={theme.colors.textTertiary}>
                {t('settings.currentLevelDesc')}
              </Text>
            </View>
            <Badge label={profile?.current_level ?? 'A1'} tone="primary" solid />
          </View>
        </SettingsGroup>

        {/* ---- Reminders --------------------------------------------------- */}
        <SettingsGroup title={t('settings.reminders')} footer={t('settings.remindersFooter')}>
          <SettingsToggleRow
            label={t('settings.dailyReminder')}
            description={
              profile?.reminder_time
                ? t('settings.reminderAt', {time: profile.reminder_time.slice(0, 5)})
                : t('settings.reminderOff')
            }
            value={profile?.notifications_enabled ?? false}
            onValueChange={next =>
              save({
                notifications_enabled: next,
                // Give the reminder a sane default the first time it is enabled.
                reminder_time: next ? profile?.reminder_time ?? '20:00:00' : profile?.reminder_time,
              })
            }
          />
        </SettingsGroup>

        {/* ---- App --------------------------------------------------------- */}
        <SettingsGroup title={t('settings.app')}>
          <SettingsNavRow
            icon={ui?.flag}
            label={t('settings.interfaceLanguage')}
            value={ui?.nativeName ?? '—'}
            onPress={() => setPicker('ui')}
          />
          <Hairline />
          <SettingsNavRow
            label={t('settings.appearance')}
            value={(() => {
              const option = THEME_OPTIONS.find(o => o.value === theme.preference);
              return option ? t(option.titleKey) : undefined;
            })()}
            onPress={() => setExpanded(expanded === 'theme' ? null : 'theme')}
          />
          <Hairline />
          <SettingsToggleRow
            label={t('settings.sound')}
            value={profile?.sound_enabled ?? true}
            onValueChange={next => save({sound_enabled: next})}
          />
          <Hairline />
          <SettingsToggleRow
            label={t('settings.haptics')}
            value={profile?.haptics_enabled ?? true}
            onValueChange={next => save({haptics_enabled: next})}
          />
        </SettingsGroup>

        {expanded === 'theme' && (
          <View style={{gap: theme.spacing.sm}}>
            {THEME_OPTIONS.map(option => (
              <OptionRow
                key={option.value}
                title={t(option.titleKey)}
                description={t(option.descriptionKey)}
                selected={theme.preference === option.value}
                onPress={() => theme.setPreference(option.value)}
              />
            ))}
          </View>
        )}

        {/* ---- Account ----------------------------------------------------- */}
        <SettingsGroup title={t('settings.account')}>
          <View style={{paddingVertical: theme.spacing.md, gap: theme.spacing.xxs}}>
            <Text variant="caption" color={theme.colors.textTertiary}>
              {t('settings.signedInAs')}
            </Text>
            <Text variant="bodyStrong">{user?.email}</Text>
          </View>
        </SettingsGroup>

        <Button label={t('settings.signOut')} variant="secondary" onPress={confirmSignOut} />

        <Text variant="caption" center color={theme.colors.textTertiary}>
          {t('settings.version', {name: APP_NAME, version: APP_VERSION})}
        </Text>
      </View>

      <LanguagePicker
        visible={picker === 'learning'}
        title={t('settings.learningPickerTitle')}
        options={LEARNING_LANGUAGES}
        selectedCode={profile?.learning_language}
        gateOnAvailability
        onSelect={code => save({learning_language: code})}
        onClose={() => setPicker(null)}
      />
      <LanguagePicker
        visible={picker === 'native'}
        title={t('settings.nativePickerTitle')}
        options={NATIVE_LANGUAGES}
        selectedCode={profile?.native_language}
        onSelect={code => save({native_language: code})}
        onClose={() => setPicker(null)}
      />
      <LanguagePicker
        visible={picker === 'ui'}
        title={t('settings.uiPickerTitle')}
        options={UI_LANGUAGES}
        selectedCode={profile?.ui_language}
        onSelect={code => save({ui_language: code})}
        onClose={() => setPicker(null)}
      />
    </Screen>
  );
};

const Hairline = () => {
  const theme = useTheme();
  return <View style={{height: 1, backgroundColor: theme.colors.border}} />;
};
