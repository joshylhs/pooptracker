import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface ScreenContainerProps {
  children: ReactNode;
  /** Centre content vertically (used by auth screens). Defaults to false. */
  centered?: boolean;
  /** Additional style overrides. */
  style?: ViewStyle;
}

export default function ScreenContainer({
  children,
  centered = false,
  style,
}: ScreenContainerProps) {
  const { surface } = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: surface.background }]}
    >
      <View
        style={[
          styles.body,
          centered && styles.centered,
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  body: { flex: 1, padding: 24 },
  centered: { justifyContent: 'center' },
});
