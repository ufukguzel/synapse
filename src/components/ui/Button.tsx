import {ActivityIndicator, Pressable, StyleSheet, View, ViewStyle} from 'react-native';
import {useTheme} from '@/providers';
import type {GradientName} from '@/theme';
import {GradientSurface} from './GradientSurface';
import {Text} from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const HEIGHTS: Record<Size, number> = {sm: 40, md: 52, lg: 58};

/**
 * Thickness of the solid bottom edge that gives the button its physical look.
 * Pressing removes the edge and pushes the face down by the same amount, so the
 * button depresses into the page without the surrounding layout shifting.
 */
const DEPTH: Record<Size, number> = {sm: 2, md: 4, lg: 4};

/** Variants painted with a gradient face over a darker edge. */
const GRADIENT_VARIANTS: Partial<Record<Variant, GradientName>> = {
  primary: 'brand',
  danger: 'danger',
  success: 'success',
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  testID,
}: ButtonProps) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const gradientName = GRADIENT_VARIANTS[variant];
  const depth = variant === 'ghost' ? 0 : DEPTH[size];

  const labelColor =
    variant === 'secondary'
      ? theme.colors.text
      : variant === 'ghost'
      ? theme.colors.primary
      : theme.colors.onPrimary;

  const edgeColor = gradientName ? theme.gradients[gradientName].edge : theme.colors.borderStrong;

  const face = loading ? (
    <ActivityIndicator color={labelColor} />
  ) : (
    <Text variant="button" color={labelColor} numberOfLines={1}>
      {label}
    </Text>
  );

  const faceStyle = {height: HEIGHTS[size], borderRadius: theme.radius.lg};

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{disabled: isDisabled, busy: loading}}
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        // The edge is painted by the wrapper, so only the face moves on press.
        {
          borderRadius: theme.radius.lg,
          backgroundColor: depth > 0 ? edgeColor : 'transparent',
          paddingBottom: pressed ? 0 : depth,
          marginTop: pressed ? depth : 0,
          opacity: isDisabled ? 0.45 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {gradientName ? (
        // GradientSurface, not a bare LinearGradient: as a laid-out flex child the
        // gradient renders inset from its own frame, which let the darker edge
        // colour show as a border on all four sides instead of just the bottom.
        <GradientSurface gradient={gradientName} style={[styles.face, faceStyle]}>
          {face}
        </GradientSurface>
      ) : (
        <View
          style={[
            styles.face,
            faceStyle,
            {
              backgroundColor: variant === 'secondary' ? theme.colors.surfaceAlt : 'transparent',
            },
          ]}>
          {face}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  fullWidth: {alignSelf: 'stretch'},
});
