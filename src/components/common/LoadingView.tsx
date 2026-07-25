import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useTheme} from '@/providers';
import {Text} from '@/components/ui';

export const LoadingView = ({message}: {message?: string}) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background, gap: theme.spacing.md}]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {!!message && (
        <Text variant="caption" color={theme.colors.textSecondary}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
