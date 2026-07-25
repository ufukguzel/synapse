import {ActivityIndicator, Pressable, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '@/providers';
import {Text} from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
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

const HEIGHTS: Record<Size, number> = {sm: 36, md: 48, lg: 56};

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

  const background: Record<Variant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceAlt,
    ghost: 'transparent',
    danger: theme.colors.danger,
  };
  const labelColor: Record<Variant, string> = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.text,
    ghost: theme.colors.primary,
    danger: theme.colors.textInverse,
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{disabled: isDisabled, busy: loading}}
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        {
          height: HEIGHTS[size],
          borderRadius: theme.radius.md,
          backgroundColor: background[variant],
          paddingHorizontal: theme.spacing.lg,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={labelColor[variant]} />
      ) : (
        <Text variant="button" color={labelColor[variant]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {alignItems: 'center', justifyContent: 'center', flexDirection: 'row'},
  fullWidth: {alignSelf: 'stretch'},
});
