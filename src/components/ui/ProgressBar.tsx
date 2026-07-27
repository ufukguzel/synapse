import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useTheme} from '@/providers';
import type {GradientName} from '@/theme';
import {GradientSurface} from './GradientSurface';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  height?: number;
  trackColor?: string;
  /** Overrides the gradient with a flat fill. */
  fillColor?: string;
  gradient?: GradientName;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar = ({
  value,
  height = 12,
  trackColor,
  fillColor,
  gradient = 'brand',
  style,
}: ProgressBarProps) => {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  /**
   * The fill is sized with flex, not a percentage width: a percentage-width
   * gradient child did not resolve under Fabric and partial values rendered as an
   * empty track (0 and 1 happened to look right, which hid it).
   */
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
      <View style={styles.row}>
        {clamped > 0 &&
          (fillColor ? (
            <View
              style={{
                flex: clamped,
                backgroundColor: fillColor,
                borderRadius: theme.radius.pill,
              }}
            />
          ) : (
            <GradientSurface
              gradient={gradient}
              style={{flex: clamped, borderRadius: theme.radius.pill}}>
              {/* Glossy top highlight - only reads at chunkier heights. */}
              {height >= 10 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 6,
                    right: 6,
                    height: Math.max(2, height / 5),
                    borderRadius: theme.radius.pill,
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  }}
                />
              )}
            </GradientSurface>
          ))}
        {clamped < 1 && <View style={{flex: 1 - clamped}} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {flex: 1, flexDirection: 'row'},
});
