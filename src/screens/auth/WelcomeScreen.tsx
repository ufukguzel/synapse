import {Dimensions, StatusBar, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, GradientSurface, SynapseMark, Text} from '@/components';
import {useTheme} from '@/providers';
import type {AuthStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const HERO_RATIO = 0.46;

const SELLING_POINTS = [
  'Five focused minutes a day',
  'Spaced repetition timed to how memory fades',
  'A steady rhythm, so the habit holds',
];

export const WelcomeScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const heroHeight = Dimensions.get('window').height * HERO_RATIO;

  return (
    <View style={[styles.flex, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="light-content" />

      {/* Hero bleeds under the status bar; the brand mark sits inside the safe area. */}
      <GradientSurface
        gradient="hero"
        style={[styles.hero, {height: heroHeight, paddingTop: insets.top}]}>
        <SynapseMark size={heroHeight * 0.42} variant="mono" color={theme.brand.mist} />
        <Text variant="display" color={theme.brand.mist} center style={styles.wordmark}>
          Synapse
        </Text>
        {/* The brand's own tagline, from the logo lockup. */}
        <Text variant="bodyLg" color="rgba(236, 234, 254, 0.85)" center>
          Train your brain to think in English
        </Text>
      </GradientSurface>

      <View
        style={[
          styles.body,
          {
            paddingHorizontal: theme.spacing.xl,
            paddingBottom: insets.bottom + theme.spacing.lg,
            gap: theme.spacing.xl,
          },
        ]}>
        <View style={{gap: theme.spacing.md}}>
          {SELLING_POINTS.map(point => (
            <View key={point} style={[styles.point, {gap: theme.spacing.md}]}>
              {/* A node, not an emoji - the icon language is neural primitives. */}
              <View
                style={[
                  styles.pointNode,
                  {backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill},
                ]}
              />
              <Text variant="bodyLg" color={theme.colors.textSecondary} style={styles.flex}>
                {point}
              </Text>
            </View>
          ))}
        </View>

        <View style={{gap: theme.spacing.sm}}>
          <Button label="Get started" size="lg" onPress={() => navigation.navigate('SignUp')} />
          <Button
            label="I already have an account"
            variant="ghost"
            onPress={() => navigation.navigate('SignIn')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  wordmark: {marginTop: 8},
  body: {flex: 1, justifyContent: 'space-between', paddingTop: 28},
  point: {flexDirection: 'row', alignItems: 'center'},
  pointNode: {width: 10, height: 10, marginLeft: 8},
});
