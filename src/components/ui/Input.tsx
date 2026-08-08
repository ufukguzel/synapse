import {useState} from 'react';
import {StyleSheet, TextInput, TextInputProps, View} from 'react-native';
import {useTheme} from '@/providers';
import {Text} from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
}

export const Input = ({label, error, hint, style, ...rest}: InputProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View style={{gap: theme.spacing.sm}}>
      {!!label && (
        <Text variant="caption" color={theme.colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        {...rest}
        onFocus={e => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          styles.input,
          theme.textVariants.bodyLg,
          {
            color: theme.colors.text,
            backgroundColor: error
              ? theme.colors.dangerSoft
              : focused
              ? theme.colors.surface
              : theme.colors.surfaceAlt,
            borderColor,
            // A thicker ring on focus/error reads clearly without shifting layout,
            // because the border box is the same size at both weights.
            borderWidth: focused || !!error ? 2 : 1.5,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.base,
          },
          style,
        ]}
      />
      {!!(error || hint) && (
        <Text variant="caption" color={error ? theme.colors.danger : theme.colors.textTertiary}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {height: 56},
  label: {fontWeight: '600'},
});
