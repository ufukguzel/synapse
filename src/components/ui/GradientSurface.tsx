import {useRef, type ReactNode} from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {useTheme} from '@/providers';
import type {GradientName} from '@/theme';

export interface GradientSurfaceProps {
  children: ReactNode;
  gradient?: GradientName;
  style?: StyleProp<ViewStyle>;
}

/**
 * A gradient background behind normally-laid-out children.
 *
 * Two deliberate choices here, both learned the hard way:
 *
 * 1. The gradient is painted by react-native-svg, not
 *    react-native-linear-gradient. That package predates Fabric and misbehaves
 *    under it - it neither measures its children nor fills its own frame, which
 *    produced three separate visual bugs (a collapsed hero, a button whose darker
 *    edge showed on all four sides, and a progress bar that looked empty at
 *    partial values).
 * 2. Layout is driven by a plain View with the paint pinned behind it, so the
 *    height always follows the content and no caller has to hard-code a size.
 */

/** Gradient ids must be unique per mounted instance or SVG reuses the first one. */
let instanceCounter = 0;

export const GradientSurface = ({children, gradient = 'brand', style}: GradientSurfaceProps) => {
  const theme = useTheme();
  const idRef = useRef<string | null>(null);
  if (!idRef.current) {
    instanceCounter += 1;
    idRef.current = `grad-surface-${instanceCounter}`;
  }
  const id = idRef.current;

  const colors = theme.gradients[gradient].colors;
  const lastIndex = colors.length - 1;

  return (
    <View style={[styles.container, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Percentage sizing avoids an onLayout measure pass. */}
        <Svg width="100%" height="100%">
          <Defs>
            {/* 135deg per the brand's "Neural Flow" gradient. */}
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              {colors.map((color, index) => (
                <Stop
                  key={`${id}-${index}`}
                  offset={lastIndex === 0 ? 0 : index / lastIndex}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // overflow keeps the gradient inside any borderRadius set by `style`.
  container: {overflow: 'hidden'},
});
