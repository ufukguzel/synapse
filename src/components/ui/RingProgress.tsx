import type {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {useTheme} from '@/providers';

export interface RingProgressProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  trackColor?: string;
  fillColor?: string;
  /** Rendered centered inside the ring. */
  children?: ReactNode;
}

/** A circular progress ring — the flat bar's expressive sibling. */
export const RingProgress = ({
  value,
  size = 84,
  stroke = 9,
  trackColor,
  fillColor,
  children,
}: RingProgressProps) => {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View
      style={{width: size, height: size}}
      accessibilityRole="progressbar"
      accessibilityValue={{min: 0, max: 100, now: Math.round(clamped * 100)}}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor ?? theme.colors.surfaceAlt}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={fillColor ?? theme.colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {alignItems: 'center', justifyContent: 'center'},
});
