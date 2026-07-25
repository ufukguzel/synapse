import {Text as RNText, TextProps as RNTextProps, StyleSheet} from 'react-native';
import {useTheme} from '@/providers';
import type {TextVariant} from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
}

export const Text = ({variant = 'body', color, center, style, ...rest}: TextProps) => {
  const theme = useTheme();
  return (
    <RNText
      {...rest}
      style={[
        theme.textVariants[variant],
        {color: color ?? theme.colors.text},
        center && styles.center,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({center: {textAlign: 'center'}});
