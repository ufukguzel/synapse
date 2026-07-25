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
    <View style={{gap: theme.spacing.xs}}>
      {!!label && (
        <Text variant="caption" color={theme.colors.textSecondary}>
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
          theme.textVariants.body,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceAlt,
            borderColor,
            borderRadius: theme.radius.md,
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
  input: {height: 48, borderWidth: 1},
});
