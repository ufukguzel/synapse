import type {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '@/providers';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
}

export const Card = ({children, style, padded = true, elevated = true}: CardProps) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.base : 0,
        },
        elevated && theme.shadow.sm,
        style,
      ]}>
      {children}
    </View>
  );
};
