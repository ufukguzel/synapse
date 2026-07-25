import type {ReactNode} from 'react';
import {ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Edge, SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@/providers';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Screen = ({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  style,
  contentContainerStyle,
}: ScreenProps) => {
  const theme = useTheme();
  const padding = padded ? theme.spacing.base : 0;

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, {backgroundColor: theme.colors.background}, style]}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{padding, flexGrow: 1}, contentContainerStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, {padding}, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({flex: {flex: 1}});
