import {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {Button, Screen, SynapseMark, Text} from '@/components';
import {useUpdateProfile} from '@/hooks';
import {useTheme} from '@/providers';

export const ReminderSetupScreen = () => {
  const theme = useTheme();
  const updateProfile = useUpdateProfile();

  const finish = async () => {
    await updateProfile.mutateAsync({onboarding_completed: true});
  };

  // A slow "breathing" loop drives the mark's scale, opacity and a gentle float,
  // so the empty middle of the screen feels alive without being distracting.
  const breath = useSharedValue(0);
  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {duration: 2600, easing: Easing.inOut(Easing.quad)}),
      -1,
      true,
    );
  }, [breath]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + breath.value * 0.45,
    transform: [{scale: 0.9 + breath.value * 0.16}, {translateY: (0.5 - breath.value) * 10}],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + breath.value * 0.16,
    transform: [{scale: 0.85 + breath.value * 0.5}],
  }));

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(520)} style={{gap: theme.spacing.sm}}>
        <Text variant="h1">Stay on track</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Daily reminders keep your streak alive. You can turn them on later in Settings.
        </Text>
      </Animated.View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        {/* Soft brand-tinted halo breathing behind the mark. */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: theme.colors.primary,
            },
            haloStyle,
          ]}
        />
        <Animated.View entering={FadeInUp.delay(150).duration(700)} style={markStyle}>
          <SynapseMark size={132} />
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(300).duration(520)}
        style={{paddingBottom: theme.spacing.lg}}>
        <Button label="Start learning" size="lg" loading={updateProfile.isPending} onPress={finish} />
      </Animated.View>
    </Screen>
  );
};
