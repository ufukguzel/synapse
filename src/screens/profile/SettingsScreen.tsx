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
import {useAuth, useTheme, type ThemePreference} from '@/providers';
import {formatMinutes} from '@/utils';
import type {Profile} from '@/types';

type PickerKind = 'learning' | 'ui' | 'native' | null;

const THEME_OPTIONS: {value: ThemePreference; title: string; description: string}[] = [
  {value: 'brand', title: 'Deep Space', description: 'The brand theme. Recommended.'},
  {value: 'light', title: 'Light', description: 'A lighter variant for bright rooms.'},
  {value: 'system', title: 'Match device', description: 'Follow your system appearance.'},
];

export const SettingsScreen = () => {
  const theme = useTheme();
  const {signOut, user, profile} = useAuth();
  const updateProfile = useUpdateProfile();

  const [picker, setPicker] = useState<PickerKind>(null);
  const [expanded, setExpanded] = useState<'theme' | 'goal' | null>(null);

  /** Every setting writes straight through to the profile so it follows the account. */
  const save = (patch: Partial<Profile>) => {
    updateProfile.mutate(patch, {
      onError: error =>
        Alert.alert(
          'Could not save',
          error instanceof Error ? error.message : 'Please try again.',
        ),
    });
  };

  const learning = findLanguage(LEARNING_LANGUAGES, profile?.learning_language);
  const ui = findLanguage(UI_LANGUAGES, profile?.ui_language);
  const native = findLanguage(NATIVE_LANGUAGES, profile?.native_language);

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'You can pick up where you left off any time.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert(
              'Sign out failed',
              error instanceof Error ? error.message : 'Please try again.',
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
        <SettingsGroup
          title="Learning"
          footer="Only English has lessons today. The other languages are listed so you can see what is coming.">
          <SettingsNavRow
            icon={learning?.flag}
            label="I'm learning"
            description={learning?.englishName}
            value={learning?.nativeName ?? '—'}
            onPress={() => setPicker('learning')}
          />
          <Hairline />
          <SettingsNavRow
            icon={native?.flag}
            label="My language"
            description="Used for translations and hints"
            value={native?.nativeName ?? '—'}
            onPress={() => setPicker('native')}
          />
          <Hairline />
          <SettingsNavRow
            label="Daily goal"
            value={formatMinutes(profile?.daily_goal_minutes ?? 10)}
            onPress={() => setExpanded(expanded === 'goal' ? null : 'goal')}
          />
        </SettingsGroup>

        {expanded === 'goal' && (
          <View style={{gap: theme.spacing.sm}}>
            {DAILY_GOAL_OPTIONS.map(option => (
              <OptionRow
                key={option}
                title={`${formatMinutes(option)} a day`}
                selected={(profile?.daily_goal_minutes ?? 10) === option}
                onPress={() => save({daily_goal_minutes: option})}
              />
            ))}
          </View>
        )}

        {/* ---- Level ------------------------------------------------------- */}
        <SettingsGroup title="Level">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              gap: theme.spacing.md,
            }}>
            <View style={{flex: 1, gap: theme.spacing.xxs}}>
              <Text variant="bodyStrong">Current level</Text>
              <Text variant="caption" color={theme.colors.textTertiary}>
                Set when you joined. A placement check is coming.
              </Text>
            </View>
            <Badge label={profile?.current_level ?? 'A1'} tone="primary" solid />
          </View>
        </SettingsGroup>

        {/* ---- Reminders --------------------------------------------------- */}
        <SettingsGroup
          title="Reminders"
          footer="Memory fades without recall. A gentle nudge keeps your pathways lit.">
          <SettingsToggleRow
            label="Daily reminder"
            description={
              profile?.reminder_time
                ? `At ${profile.reminder_time.slice(0, 5)}`
                : 'Off - no reminder scheduled'
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
        <SettingsGroup title="App">
          <SettingsNavRow
            icon={ui?.flag}
            label="Interface language"
            value={ui?.nativeName ?? '—'}
            onPress={() => setPicker('ui')}
          />
          <Hairline />
          <SettingsNavRow
            label="Appearance"
            value={THEME_OPTIONS.find(option => option.value === theme.preference)?.title}
            onPress={() => setExpanded(expanded === 'theme' ? null : 'theme')}
          />
          <Hairline />
          <SettingsToggleRow
            label="Sound effects"
            value={profile?.sound_enabled ?? true}
            onValueChange={next => save({sound_enabled: next})}
          />
          <Hairline />
          <SettingsToggleRow
            label="Haptics"
            value={profile?.haptics_enabled ?? true}
            onValueChange={next => save({haptics_enabled: next})}
          />
        </SettingsGroup>

        {expanded === 'theme' && (
          <View style={{gap: theme.spacing.sm}}>
            {THEME_OPTIONS.map(option => (
              <OptionRow
                key={option.value}
                title={option.title}
                description={option.description}
                selected={theme.preference === option.value}
                onPress={() => theme.setPreference(option.value)}
              />
            ))}
          </View>
        )}

        {/* ---- Account ----------------------------------------------------- */}
        <SettingsGroup title="Account">
          <View style={{paddingVertical: theme.spacing.md, gap: theme.spacing.xxs}}>
            <Text variant="caption" color={theme.colors.textTertiary}>
              Signed in as
            </Text>
            <Text variant="bodyStrong">{user?.email}</Text>
          </View>
        </SettingsGroup>

        <Button label="Sign out" variant="secondary" onPress={confirmSignOut} />

        <Text variant="caption" center color={theme.colors.textTertiary}>
          {APP_NAME} v0.1.0
        </Text>
      </View>

      <LanguagePicker
        visible={picker === 'learning'}
        title="What are you learning?"
        options={LEARNING_LANGUAGES}
        selectedCode={profile?.learning_language}
        gateOnAvailability
        onSelect={code => save({learning_language: code})}
        onClose={() => setPicker(null)}
      />
      <LanguagePicker
        visible={picker === 'native'}
        title="Your language"
        options={NATIVE_LANGUAGES}
        selectedCode={profile?.native_language}
        onSelect={code => save({native_language: code})}
        onClose={() => setPicker(null)}
      />
      <LanguagePicker
        visible={picker === 'ui'}
        title="Interface language"
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
