import {StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '@/providers';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar = ({value, height = 8, trackColor, fillColor, style}: ProgressBarProps) => {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{min: 0, max: 100, now: Math.round(clamped * 100)}}
      style={[
        {
          height,
          borderRadius: theme.radius.pill,
          backgroundColor: trackColor ?? theme.colors.surfaceAlt,
          overflow: 'hidden',
        },
        style,
      ]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: theme.radius.pill,
          backgroundColor: fillColor ?? theme.colors.primary,
        }}
      />
    </View>
  );
};
