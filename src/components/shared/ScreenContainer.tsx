import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { backgroundColor: surface.background }]}>
      <View
        style={[
          styles.body,
          centered && styles.centered,
          centered && { paddingTop: insets.top },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 24 },
  centered: { justifyContent: 'center' },
});
