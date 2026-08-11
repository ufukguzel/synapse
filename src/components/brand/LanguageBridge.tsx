import {useEffect, useState} from 'react';
import {View, type LayoutChangeEvent} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Line} from 'react-native-svg';
import {Text} from '@/components/ui';
import {useTheme} from '@/providers';

export interface LanguageBridgeEndpoint {
  /** Emoji flag. */
  flag: string;
  /** Name shown under the node, e.g. "Türkçe". */
  name: string;
  /** Small role label above the name, e.g. "You speak". */
  role: string;
}

export interface LanguageBridgeProps {
  /** Left node - the language the learner already speaks. */
  native: LanguageBridgeEndpoint;
  /** Right node - the language being learned. */
  learning: LanguageBridgeEndpoint;
  /** Diameter of the flag nodes. */
  nodeSize?: number;
}

/**
 * The native and target languages drawn as two neurons joined by an axon, with a
 * synapse pulse travelling from what you speak toward what you're learning. It
 * makes the app's core relationship - "I know X, I'm building Y" - the first
 * thing you see, instead of leaving it implicit in the onboarding choices.
 */
export const LanguageBridge = ({native, learning, nodeSize = 60}: LanguageBridgeProps) => {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {duration: 2200, easing: Easing.inOut(Easing.cubic)}),
      -1,
      false,
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{translateX: pulse.value * Math.max(0, trackWidth - 8)}],
    // Fade in as it leaves the source and out as it arrives, so it reads as a
    // signal crossing the gap rather than a bead on a wire.
    opacity: interpolate(pulse.value, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
  }));

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const node = (endpoint: LanguageBridgeEndpoint, tone: string) => (
    <View style={{alignItems: 'center', gap: theme.spacing.xs, width: nodeSize + 24}}>
      <View
        style={{
          width: nodeSize,
          height: nodeSize,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 2,
          borderColor: tone,
          ...theme.shadow.sm,
        }}>
        <Text style={{fontSize: nodeSize * 0.5}}>{endpoint.flag}</Text>
      </View>
      <View style={{alignItems: 'center', gap: 2}}>
        <Text variant="overline" color={theme.colors.textTertiary}>
          {endpoint.role}
        </Text>
        <Text variant="bodyStrong" center numberOfLines={1}>
          {endpoint.name}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch'}}>
      {node(native, theme.colors.primary)}

      {/* The axon: a dashed track with a pulse that crosses toward the target. */}
      <View style={{flex: 1, height: nodeSize, justifyContent: 'center'}} onLayout={onTrackLayout}>
        <Svg width="100%" height={2} style={{position: 'absolute'}}>
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={theme.colors.border}
            strokeWidth={2}
            strokeDasharray="3 4"
          />
        </Svg>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.accent,
            },
            dotStyle,
          ]}
        />
      </View>

      {node(learning, theme.colors.accent)}
    </View>
  );
};
