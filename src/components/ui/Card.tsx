import type {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '@/providers';
import type {GradientName} from '@/theme';
import {GradientSurface} from './GradientSurface';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
  /** Paints the card with a gradient instead of the flat surface colour. */
  gradient?: GradientName;
}

export const Card = ({children, style, padded = true, elevated = true, gradient}: CardProps) => {
  const theme = useTheme();

  const base: ViewStyle = {
    borderRadius: theme.radius.xl,
    padding: padded ? theme.spacing.lg : 0,
    overflow: 'hidden',
  };

  // GradientSurface rather than a bare LinearGradient, which would not size
  // itself to the card's content - see the note in GradientSurface.
  if (gradient) {
    return (
      <GradientSurface gradient={gradient} style={[base, elevated && theme.shadow.md, style]}>
        {children}
      </GradientSurface>
    );
  }

  return (
    <View
      style={[
        base,
        {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        elevated && theme.shadow.sm,
        style,
      ]}>
      {children}
    </View>
  );
};
